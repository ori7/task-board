const noteTemplate =
    `
    <div class = "note col-sm-2">
    <br>
        <p class="noteContent">{{task}}</p>
        <p class="date">{{date}}</p>
        <p class="time">{{time}}</p>
        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
    </div>
    `

const checks = modulePatternChecks();
const fade = modulePatternFade();
const local_S = modulePatternLocalStorage();
const taskBoard = modulePatternTaskBoard();

let firstView = local_S.getNotesFromLocalStorage();
firstView = taskBoard.createNotes(firstView);
firstView = taskBoard.viewNotes(firstView);

optionDeliteNote();           //  It is necessary to call this function here in order that the notes that get from the local storage can be erased.

document.getElementById("save").addEventListener("click", function (e) {
    e.preventDefault();
    const task = document.getElementById("task").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const check = checks.checkNote(task, date, time);
    if (checks.checkNoteComment(check) === "next") {               //   This means that the data was entered correctly and the comments (if any) were deleted.
        const noteArray = local_S.getNotesFromLocalStorage();               //   This is to get the number of the notes on the board.
        const noteObjectInArray = [noteObject = new taskBoard.noteObjectBuilt(task, date, time)];
        local_S.saveInLocalStorage(noteObject, noteArray.length);             //  Uses array length to find the number of the new note and put it with this key in the local storage.
        const noteTemplateArray = taskBoard.createNotes(noteObjectInArray);
        taskBoard.viewNotes(noteTemplateArray);
        const newNote = document.getElementById("note").lastElementChild;    //  This function captures the last note (currently added to the document), to enable in the next line (through a special function) a 'fade in' effect on this note only when added.
        fade.fadeIn(newNote);
        taskBoard.clearForm();
        optionDeliteNote();
    }
})

function optionDeliteNote() {
    let deliteArray = document.querySelectorAll('.glyphicon-remove');
    let NoteArray = document.querySelectorAll('.note');
    for (let noteNumber = 0; noteNumber < deliteArray.length; noteNumber++) {
        deliteArray[noteNumber].addEventListener('click', function () {
            local_S.updateLocalStorage(noteNumber);
            fade.deliteNoteByfadeOut(NoteArray[noteNumber]);
        })
    }
}

function modulePatternChecks() {

    function checkNote(task, date, time) {
        let check = "next";
        if (task === "")
            check = "taskLes";
        else if (!/2019-([0]{1}[1-9]{1}|[1]{1}[0-2]{1})-([0-2]{1}[\d]{1}|[3]{1}[01]{1})/gm.test(date))
            check = "dateWrong";
        else if (!/([0-1]{1}[\d]{1}|2{1}[0-3]{1}):[0-5]{1}[\d]{1}/gm.test(time) && time !== "")
            check = "timeWrong";
            console.log(check);return check;
    }

    function checkNoteComment(check) {
        if (check === "taskLes")
            document.getElementById('commentTask').style.visibility = "visible";
        else if (check === "dateWrong")
            document.getElementById('commentDate').style.visibility = "visible";
        else if (check === "timeWrong")
            document.getElementById('commentTime').style.visibility = "visible";
        else {
            document.getElementById('commentTask').style.visibility = "hidden";
            document.getElementById('commentDate').style.visibility = "hidden";
            document.getElementById('commentTime').style.visibility = "hidden";
        }
        return check;
    }

    return {
        checkNote: checkNote,
        checkNoteComment: checkNoteComment
    }
}

function modulePatternTaskBoard() {

    function noteObjectBuilt(task, date, time) {
        this.task = task;
        this.date = date;
        this.time = time;
        return this;
    }

    function createNotes(noteArray) { 
        /*
        This function returns an array, although in most cases it provides only one element.
        This is to provide a solution to display multiple notes at once when refreshing the display.
        */
        let noteTemplateArray = [];
        for (let i = 0; i < noteArray.length; i++) {
            let newNoteTemplate = noteTemplate.replace("{{task}}", noteArray[i].task);
            newNoteTemplate = newNoteTemplate.replace("{{date}}", noteArray[i].date);
            newNoteTemplate = newNoteTemplate.replace("{{time}}", noteArray[i].time);
            noteTemplateArray[i] = newNoteTemplate;
        }
        return noteTemplateArray;
    }

    function viewNotes(arrayNoteTemplate) {
        for (let i = 0; i < arrayNoteTemplate.length; i++) {
            document.getElementById('note').innerHTML += arrayNoteTemplate[i];
        }
    }

    function clearForm() {
        document.getElementById("task").value = "";
        document.getElementById("date").value = "";
        document.getElementById("time").value = "";
    }

    return {
        noteObjectBuilt: noteObjectBuilt,
        createNotes: createNotes,
        viewNotes: viewNotes,
        clearForm: clearForm
    }
}

function modulePatternLocalStorage() {

    function saveInLocalStorage(noteObject, noteNumber) {
        localStorage.setItem('note ' + noteNumber, JSON.stringify(noteObject));
    }

    function getNotesFromLocalStorage() {
        const noteArray = [];
        for (let i = 0; ; i++) {
            const note = JSON.parse(localStorage.getItem('note ' + i));
            if (note === null)
                break;
            noteArray.push(note);
        }
        return noteArray;
    }

    function updateLocalStorage(noteNumberToDelite) {
        const updatedNoteArray = local_S.getNotesFromLocalStorage();
        for (let k = noteNumberToDelite; k < updatedNoteArray.length; k++)
            updatedNoteArray[k] = updatedNoteArray[k + 1];
        updatedNoteArray.pop();
        localStorage.clear();
        for (let k = 0; k < updatedNoteArray.length; k++)
            local_S.saveInLocalStorage(updatedNoteArray[k], k);
    }

    return {
        saveInLocalStorage: saveInLocalStorage,
        getNotesFromLocalStorage: getNotesFromLocalStorage,
        updateLocalStorage: updateLocalStorage
    }
}

function modulePatternFade() {

    function fadeIn(elementToFadeIn) {
        /*
        This function attaches to the new element a class in order to create a 'fade in' effect (from the css file) when it appears. 
        The class is removed from the element immediately afterwards so that the fade will not happen again.
        */
        elementToFadeIn.classList.add('fadeIn');
        setTimeout(function () {
            elementToFadeIn.classList.remove('fadeIn');
        }, 2000);
    }

    function deliteNoteByfadeOut(elementToFadeOut) {
        /*
        This function attaches to an element that needs to be deleted a class in order to create a 'fade out' effect. 
        A tenth of a second before the end of the effect, the element is completely removed. 
        This time difference is designed to prevent the element from flashing again before removing it.
        */
        elementToFadeOut.classList.add('fadeOut');
        setTimeout(function () {
            elementToFadeOut.parentNode.removeChild(elementToFadeOut);
        }, 1900);
    }

    return {
        fadeIn: fadeIn,
        deliteNoteByfadeOut: deliteNoteByfadeOut
    }
}