on run argv
    set tabName to item 1 of argv
    tell application "Google Chrome"
        set found to false
        repeat with w in windows
            repeat with t in tabs of w
                if title of t contains tabName then
                    set found to true
                    exit repeat
                end if
            end repeat
            if found then
                exit repeat
            end if
        end repeat
        return found
    end tell
end run