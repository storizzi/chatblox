from flask import Flask, request, render_template, jsonify
import socket
from dotenv import load_dotenv
import os
import json
import subprocess
import shlex
import webbrowser
import threading
import re

# Load environment variables from .env file
load_dotenv()

max_install_attempts = 3  # Define the maximum number of install attempts
commands_config_global = None

def load_global_config():
    global commands_config_global
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))  # Gets the directory where the script is located
        file_path = os.path.join(script_dir, 'commands.json')

        with open(file_path, 'r') as file:
            commands_config_global = json.load(file)
        print("Loaded commands.json successfully.")
    except Exception as e:
        print(f"Error loading commands.json: {e}")

def load_script_settings(script_file_name):
    script_base_name = os.path.splitext(os.path.basename(script_file_name))[0]
    settings_path = os.path.join(os.path.dirname(__file__), 'script-settings', f'{script_base_name}.properties')
    settings = {}
    print(f'Loading script settings from {settings_path}...')

    if os.path.exists(settings_path):
        with open(settings_path, 'r') as file:
            lines = file.readlines()
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        settings[key.strip()] = value.strip()

    return settings

def exec_command(command, script_settings):
    try:
        env = {**os.environ, **script_settings}
        result = subprocess.run(command, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
        if result.stderr:
            return {'error': result.stderr.strip(), 'stdout': result.stdout.strip()}
        return {'error': None, 'stdout': result.stdout.strip()}
    except subprocess.CalledProcessError as error:
        return {'error': str(error), 'stdout': None}

def install_missing_module(module_name, cwd, attempts):
    print(f"Attempting to install missing module '{module_name}'...")
    install_command = f"npm install {module_name}"
    try:
        subprocess.run(install_command, shell=True, check=True, cwd=cwd, text=True)
        print(f"Module '{module_name}' installed successfully.")
    except subprocess.CalledProcessError as install_error:
        raise Exception(f"Failed to install module '{module_name}' after {attempts + 1} attempts: {install_error}")

def execute_node_script(script_path, parameters, script_settings, attempts=0):
    command_to_run = f"node {script_path} {' '.join(parameters)}"
    try:
        result = exec_command(command_to_run, script_settings)
        if result['error'] is None:
            return result
        else:
            # Handling module installation errors
            print(f"Error executing script '{script_path}': {result['error']}")
            error_message = result['error']
            if "Cannot find" in error_message and "ERR_MODULE_NOT_FOUND" in error_message and attempts < max_install_attempts:
                module_not_found_pattern = r"Cannot find (?:module|package) '([^']+)'"
                match = re.search(module_not_found_pattern, error_message)
                print(f"Failed to execute script '{script_path}' due to missing module. Attempting to install it...")
                if match:
                    print(f"Installing missing module '{match.group(1)}'...")
                    module_name = match.group(1)
                    install_missing_module(module_name, os.path.dirname(script_path), attempts)
                    return execute_node_script(script_path, parameters, script_settings, attempts + 1)
            return result
    except Exception as error:
        return {'error': str(error), 'stdout': None}

def execute_script(matched_command, parameters):
    script_file = matched_command['process'].split(' ')[0]
    script_path = os.path.join(os.path.dirname(__file__), 'commands', script_file)
    script_settings = load_script_settings(script_file)
    wrapped_parameters = ['"{}"'.format(param.replace('"', '\\"')) for param in parameters]

    if matched_command['type'] == 'node':
        return execute_node_script(script_path, wrapped_parameters, script_settings)
    elif matched_command['type'] == 'osascript':
        command_to_run = f'osascript {script_path} {" ".join(wrapped_parameters)}'
        return exec_command(command_to_run, script_settings)
    elif matched_command['type'] == 'bash':
        command_to_run = f'{script_path} {" ".join(wrapped_parameters)}'
        return exec_command(command_to_run, script_settings)
    else:
        raise ValueError('Command type not recognized')

def validate_parameters(parameters, parameter_definitions):
    if len(parameters) > len(parameter_definitions):
        return {'isValid': False, 'message': 'Too many parameters.'}

    for i, definition in enumerate(parameter_definitions):
        param = parameters[i] if i < len(parameters) else None
        is_required = definition.get('required', False)

        if is_required and not param:
            return {'isValid': False, 'message': f"Parameter '{definition['name']}' is required."}

        if param:
            if definition.get('type') == 'integer':
                try:
                    int(param)
                except ValueError:
                    return {'isValid': False, 'message': f"Parameter '{definition['name']}' must be an integer."}

            if definition.get('type') == 'boolean' and param not in ['true', 'false']:
                return {'isValid': False, 'message': f"Parameter '{definition['name']}' must be a boolean (true or false)."}

    return {'isValid': True}

def execute_hook(hook_name, parameters, commands_config=None):
    global commands_config_global
    if commands_config is None:
        if commands_config_global is None:
            print("Loading commands.json...")
            load_global_config()
        commands_config = commands_config_global
    hook_command = next((cmd for cmd in commands_config if 'hooks' in cmd and hook_name in cmd['hooks']), None)
    if hook_command:
        result = execute_script(hook_command, parameters)
        print(f"Hook '{hook_name}' result: {result['stdout']} param: {parameters} hookCommand: {hook_command}")

        if result['error']:
            raise Exception(result['error'])

        return result['stdout']

    return None

def open_browser(port):
    hook_result = execute_hook('chromeTabCheck', ['Chat Terminal'])
    if hook_result == 'false':
        print('Opening browser...')
        webbrowser.open_new(f'http://localhost:{port}')
    else:
        print('Tab check passed, not opening a new tab.')

def send_response(error, stdout=None):
    if error:
        response_data = {'type': 'Error', 'message': str(error)}
    else:
        response_data = {'type': 'Output', 'message': stdout or 'No output'}
    return jsonify(response_data)

app = Flask(__name__)

@app.route('/')
def index():
    # Serve your HTML page from the templates folder
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute():
    data = request.get_json()  # Parse JSON data
    if not data or 'input' not in data:
        return send_response('Invalid request')

    userInput = data['input']
    matchedCommand = None  # Initialize matchedCommand to None

    for cmd in commands_config_global:
        try:
            if re.match(cmd['regex'], userInput):
                matchedCommand = cmd
                break
        except re.error as e:
            print(f"Regex error with pattern {cmd['regex']}: {e}")

    if matchedCommand:
        parameters = re.match(matchedCommand['regex'], userInput).groups()
        validation = validate_parameters(parameters, matchedCommand.get('parameters', []))

        if not validation['isValid']:
            return send_response(validation['message'])

        try:
            result = execute_script(matchedCommand, parameters)
            if result['error']:
                return send_response(result['error'])
            else:
                return send_response(None, result['stdout'])
        except Exception as error:
            return send_response(str(error))
    else:
        return send_response('Command not recognized')

if __name__ == '__main__':
    # Get environment variables
    port = os.getenv('PORT', 5001)
    run_env = os.getenv('ENV', 'development')
    is_dev_mode = run_env == 'development'

    load_global_config()

    if is_dev_mode and not os.environ.get('WERKZEUG_RUN_MAIN'):
        # Opening the browser in a separate thread to avoid blocking Flask's main thread
        threading.Timer(1.25, open_browser, args=[port]).start()

    app.run(debug=True, port=port)
