
package provide dialog_startup 0.1

package require scrollboxwindow

namespace eval dialog_startup {
    variable defeatrt_flag 0

    namespace export pdtk_startup_dialog
}

########## pdtk_startup_dialog -- dialog window for startup options #########
# Create a simple modal window with an entry widget
# for editing/adding a startup command
# (the next-best-thing to in-place editing)
proc ::dialog_startup::chooseCommand { prompt initialValue } {
    global cmd
    set cmd $initialValue

    toplevel .inputbox -class DialogWindow
    wm title .inputbox $prompt
    wm group .inputbox .
    wm minsize .inputbox 450 30
    wm resizable .inputbox 0 0
    wm geom .inputbox "450x30"

    button .inputbox.button -text [_ "OK"] -command { destroy .inputbox } \
        -width [::msgcat::mcmax [_ "OK"]]

    entry .inputbox.entry -width 50 -textvariable cmd
    pack .inputbox.button -side right
    bind .inputbox.entry <KeyPress-Return> { destroy .inputbox }
    bind .inputbox.entry <KeyPress-Escape> { destroy .inputbox }
    pack .inputbox.entry -side right -expand 1 -fill x -padx 2m

    raise .inputbox
    focus .inputbox.entry
    wm transient .inputbox
    grab .inputbox
    tkwait window .inputbox

    return $cmd
}

proc ::dialog_startup::cancel {mytoplevel} {
    ::scrollboxwindow::cancel $mytoplevel
}

proc ::dialog_startup::ok {mytoplevel} {
    ::scrollboxwindow::ok $mytoplevel dialog_startup::commit
}

proc ::dialog_startup::add {} {
    return [chooseCommand [_ "Add new library"] ""]
}

proc ::dialog_startup::edit { current_library } {
    return [chooseCommand [_ "Edit library"] $current_library]
}

proc ::dialog_startup::commit { new_startup } {
    variable defeatrt_button
    set ::startup_libraries $new_startup
    pdsend "pd startup-dialog $defeatrt_button [pdtk_encodedialog $::startup_flags] [pdtk_encode $::startup_libraries]"
}

# set up the panel with the info from pd
proc ::dialog_startup::pdtk_startup_dialog {mytoplevel defeatrt flags} {
    variable defeatrt_button $defeatrt
    if {$flags ne ""} {variable ::startup_flags [subst -nocommands $flags]}

    if {[winfo exists $mytoplevel]} {
        wm deiconify $mytoplevel
        raise $mytoplevel
        focus $mytoplevel
    } else {
        create_dialog $mytoplevel
    }
}

proc ::dialog_startup::create_dialog {mytoplevel} {
    ::scrollboxwindow::make $mytoplevel $::startup_libraries \
        dialog_startup::add dialog_startup::edit dialog_startup::commit \
        [_ "Pd libraries to load on startup"] \
        450 300 0
    wm withdraw $mytoplevel
    ::pd_bindings::dialog_bindings $mytoplevel "startup"

    frame $mytoplevel.flags
    pack $mytoplevel.flags -side top -anchor s -fill x -padx 2m
    label $mytoplevel.flags.entryname -text [_ "Startup flags:"]
    entry $mytoplevel.flags.entry -textvariable ::startup_flags
    pack $mytoplevel.flags.entry -side right -expand 1 -fill x
    pack $mytoplevel.flags.entryname -side right

    if {$::windowingsystem ne "win32"} {
        frame $mytoplevel.defeatrtframe
        pack $mytoplevel.defeatrtframe -side top -anchor s -fill x -padx 2m -pady 5
        checkbutton $mytoplevel.defeatrtframe.defeatrt -anchor w \
            -text [_ "Defeat real-time scheduling"] \
            -variable ::dialog_startup::defeatrt_button
        pack $mytoplevel.defeatrtframe.defeatrt
    }

    # focus handling on OSX
    if {$::windowingsystem eq "aqua"} {

        # unbind ok button when in listbox
        bind $mytoplevel.listbox.box <FocusIn> "::dialog_startup::unbind_return $mytoplevel"
        bind $mytoplevel.listbox.box <FocusOut> "::dialog_startup::rebind_return $mytoplevel"

        # call apply on Return in entry boxes that are in focus & rebind Return to ok button
        bind $mytoplevel.flags.entry <KeyPress-Return> "::dialog_startup::rebind_return $mytoplevel"

        # unbind Return from ok button when an entry takes focus
        $mytoplevel.flags.entry config -validate focusin -vcmd "::dialog_startup::unbind_return $mytoplevel"

        # remove cancel button from focus list since it's not activated on Return
        $mytoplevel.nb.buttonframe.cancel config -takefocus 0

        # show active focus on the ok button as it *is* activated on Return
        $mytoplevel.nb.buttonframe.ok config -default normal
        bind $mytoplevel.nb.buttonframe.ok <FocusIn> "$mytoplevel.nb.buttonframe.ok config -default active"
        bind $mytoplevel.nb.buttonframe.ok <FocusOut> "$mytoplevel.nb.buttonframe.ok config -default normal"

        # since we show the active focus, disable the highlight outline
        $mytoplevel.nb.buttonframe.ok config -highlightthickness 0
        $mytoplevel.nb.buttonframe.cancel config -highlightthickness 0
    }

    # set min size based on widget sizing
    update
    wm minsize $mytoplevel [winfo width $mytoplevel] [winfo reqheight $mytoplevel]

    position_over_window $mytoplevel .pdwindow
    raise $mytoplevel
}

# for focus handling on OSX
proc ::dialog_startup::rebind_return {mytoplevel} {
    bind $mytoplevel <KeyPress-Escape> "::dialog_startup::cancel $mytoplevel"
    bind $mytoplevel <KeyPress-Return> "::dialog_startup::ok $mytoplevel"
    focus $mytoplevel.nb.buttonframe.ok
    return 0
}

# for focus handling on OSX
proc ::dialog_startup::unbind_return {mytoplevel} {
    bind $mytoplevel <KeyPress-Escape> break
    bind $mytoplevel <KeyPress-Return> break
    return 1
}
