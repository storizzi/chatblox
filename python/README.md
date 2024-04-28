# Python chatblox

# Installation / Start Up

You'll need to use the Terminal to install.

You might want to install Conda first if you don't have this (or Anaconda) already installed if you want to follow the instructions below. If you're familiar with Python, you'll do it your way!

e.g. on a mac using homebrew, see [this page](https://conda.io/projects/conda/en/latest/user-guide/install/macos.html) - Miniconda will be fine.

Set up using:

```shell
conda create --name chatblox
conda activate chatblox
conda install pip
pip install flask python-dotenv
```

Start using:

```shell
cd chatblox/python
conda activate chatblox
python chatblox.py
```

If you have chrome installed, a browser window will be opened to (by default): http://localhost:3000

The default port is 5001. Set the port number in the .env file or pass as an environment variable from the environment you are calling the script from - see `.env-sample` file as an example (which you would rename to .env to use it)

## Command Details

* [Command Summary](../doc/LLM_SUMMARY_commands.md) - LLM Generated
