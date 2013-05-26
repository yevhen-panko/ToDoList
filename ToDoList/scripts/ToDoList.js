function createTaskListFromJSON(stringForParsing, TaskList) {
    var taskArray = JSON.parse(stringForParsing);
    TaskList.getTaskArray().length = 0;
    for (var i = 0; i < taskArray.length; i++) {
        var task = new Task("", "", "");
        for (var key in taskArray[i]){
            switch (key){
                case "message": task.setMessage(taskArray[i][key]); break;
                case "dateInMilliseconds": task.setDate(taskArray[i][key]); break;
                case "userName": task.setUserName(taskArray[i][key]); break;
            }
        }
        TaskList.addLast(task);
    }
}

function setListsToLocalStorage(DataModel) {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("Active", JSON.stringify(DataModel.activeTasks.getTaskArray()));
        localStorage.setItem("Completed", JSON.stringify(DataModel.completedTasks.getTaskArray()));
        localStorage.setItem("Foreign", JSON.stringify(DataModel.foreignTasks.getTaskArray()));
    }
}

function fillData(DataModel) {
    if ((typeof localStorage !== "undefined") && ((localStorage.getItem("Active") && localStorage.getItem("Active").length > 2) ||
        (localStorage.getItem("Completed") && localStorage.getItem("Completed").length > 2))) {
        var item = localStorage.getItem("Active");
        createTaskListFromJSON(item, DataModel.activeTasks);
        if (localStorage.getItem("Completed")) {
            item = localStorage.getItem("Completed");
            createTaskListFromJSON(item, DataModel.completedTasks);
        }
    } else {
        DataModel.activeTasks.addFirst(new Task("Add field user_name to Task constructor", "1368790693344", "MyName"));
        DataModel.activeTasks.addFirst(new Task("Add label important. This will be something about priority", "1368790659344", "MyName"));
        DataModel.completedTasks.addFirst(new Task("Add 'delete all completed tasks' button", "1368791760404", "MyName"));
    }
}

function addEvents(DataModel, containerID) {
    function findMaxCount() {
        if (DataModel.activeTasks.getTaskArray().length >= DataModel.completedTasks.getTaskArray().length) {
            return DataModel.activeTasks.getTaskArray().length;
        } else return DataModel.completedTasks.getTaskArray().length;
    }

    function findTaskByID($id){
        var count = findMaxCount();
        for (var i = 0; i < count; i++) {
            if (DataModel.activeTasks.getTaskArray().length > i && DataModel.activeTasks.getTaskArray()[i].getDateInMilliseconds() == $id) {
                return DataModel.activeTasks.getTaskArray()[i];
            }
        }
        return false;
    }

    function saveTaskAfterEditing(task){
        task.setMessage($("#TaskEdit").val());
        setListsToLocalStorage(DataModel);
        initialize(DataModel, containerID);
    }

    $(document).keyup(function (event) {
        if (event.keyCode == 27) {
            initialize(DataModel, containerID);
        }
    });

    $(".ActiveTask, .CompletedTask").hover(
        function () {
            $(this).addClass("Selected");
            $(".CheckTask", this).fadeIn();
            $(".DeleteTask", this).fadeIn();
            $(".UpTask", this).fadeIn();
        },
        function () {
            $(this).removeClass("Selected");
            $(".CheckTask", this).fadeOut();
            $(".DeleteTask", this).fadeOut();
            $(".UpTask", this).fadeOut();
        }
    );

    $(".DeleteTask").click(function () {
        var count = findMaxCount();
        var $id = $(this).parent().attr("id");
        if (confirm("Are you really want to delete this task?")) {
            for (var i = 0; i < count; i++) {
                if (DataModel.activeTasks.getTaskArray().length > i && DataModel.activeTasks.getTaskArray()[i].getDateInMilliseconds() == $id) {
                    DataModel.activeTasks.getTaskArray().splice(i, 1);
                    setListsToLocalStorage(DataModel);
                    break;
                } else if (DataModel.completedTasks.getTaskArray().length > i && DataModel.completedTasks.getTaskArray()[i].getDateInMilliseconds() == $id) {
                    DataModel.completedTasks.getTaskArray().splice(i, 1);
                    setListsToLocalStorage(DataModel);
                    break;
                }
            }
        }
        initialize(DataModel, containerID);
    });

    $(".CheckTask").click(function () {
        var count = findMaxCount();
        var $id = $(this).parent().attr("id");
        if ($(this).attr("checked")) {
            $(this).removeAttr("checked");
        } else $(this).attr("checked", "checked");
        for (var i = 0; i < count; i++) {
            if (DataModel.activeTasks.getTaskArray().length > i && DataModel.activeTasks.getTaskArray()[i].getDateInMilliseconds() == $id) {
                DataModel.completedTasks.addFirst(DataModel.activeTasks.getTaskArray()[i]);
                DataModel.activeTasks.getTaskArray().splice(i, 1);
                break;
            } else if (DataModel.completedTasks.getTaskArray().length > i && DataModel.completedTasks.getTaskArray()[i].getDateInMilliseconds() == $id) {
                DataModel.activeTasks.addFirst(DataModel.completedTasks.getTaskArray()[i]);
                DataModel.completedTasks.getTaskArray().splice(i, 1);
                break;
            }
        }
        setListsToLocalStorage(DataModel);
        initialize(DataModel, containerID);
    });

    $(".UpTask").click(function(){
        var $id = $(this).parent().attr("id");
        for (var i=0; i<DataModel.activeTasks.getTaskArray().length; i++){
            if (i >= 1 && DataModel.activeTasks.getTaskArray()[i].getDateInMilliseconds() == $id){
                var buffer = DataModel.activeTasks.getTaskArray()[i-1];
                DataModel.activeTasks.getTaskArray()[i-1] = DataModel.activeTasks.getTaskArray()[i];
                DataModel.activeTasks.getTaskArray()[i] = buffer;
                break;
            }
        }
        setListsToLocalStorage(DataModel);
        initialize(DataModel, containerID);
    });

    $("#NewTaskMessage").keydown(function (event) {
        if ($.trim($(this).val()).length > 0) {
            $("#AddButton").removeAttr("disabled");
        }
        if (event.ctrlKey && event.keyCode == 13) {
            DataModel.activeTasks.addFirst(new Task($("#NewTaskMessage").val()));
            setListsToLocalStorage(DataModel);
            initialize(DataModel, containerID);
        }
    }).keyup(function () {
            if ($.trim($(this).val()).length == 0) {
                $("#AddButton").attr("disabled", true);
            }
        });

    $("#AddTaskForm").submit(function () {
        DataModel.activeTasks.addFirst(new Task($("#NewTaskMessage").val()));
        setListsToLocalStorage(DataModel);
        initialize(DataModel, containerID);
        $("#AddButton").attr("disabled", true);
    });

    $(".ActiveTaskText").dblclick(function () {
        var $id = $(this).parent().attr("id");
        var task = findTaskByID($id);
        $(this).parent().empty().append('<textarea id="TaskEdit">' + task.getMessage() +
                    '</textarea><input type="button" id="SaveButton" value="Save">');
        $("#SaveButton").click(function () {
            var $id = $(this).parent().attr("id");
            var task = findTaskByID($id);
            saveTaskAfterEditing(task);
        });
        $("#TaskEdit").keydown(function (event) {
            if (event.ctrlKey && event.keyCode == 13) {
                var $id = $(this).parent().attr("id");
                var task = findTaskByID($id);
                saveTaskAfterEditing(task);
            }
        });

    });

    $("#DeleteAllCompletedTaskButton").click(function () {
        if (confirm("Are you really want to delete all completed tasks?")){
            DataModel.completedTasks.getTaskArray().length = 0;
            setListsToLocalStorage(DataModel);
            initialize(DataModel, containerID);
        }
    });
}

//This function clean container and print tasks
function initialize(DataModel, containerID) {
    $(containerID).empty();
    $("#AddTaskFormTemplate").tmpl({formID: "AddTaskForm", textAreaID: "NewTaskMessage", buttonID: "AddButton"}).appendTo(containerID);
    if (DataModel.activeTasks.getTaskArray().length > 0 || DataModel.completedTasks.getTaskArray().length > 0) {
        $(containerID).append('<ol id="TaskList"></ol>');
        $("#TaskTemplate").tmpl(DataModel.activeTasks.getTaskArray(),{liClass: "ActiveTask", taskTextClass: "ActiveTaskText", checked: "unchecked.png"}).appendTo("#TaskList");
        $("#TaskTemplate").tmpl(DataModel.completedTasks.getTaskArray(),{liClass: "CompletedTask", taskTextClass: "CompletedTaskText", checked: "checked.png"}).appendTo("#TaskList");
        $(containerID).append('<br><input type="button" id="DeleteAllCompletedTaskButton" value="Delete all completed tasks">');
        if (DataModel.completedTasks.getTaskArray().length > 0) {
            $("#DeleteAllCompletedTaskButton").fadeIn(0);
        } else $("#DeleteAllCompletedTaskButton").fadeOut();
    } else {
        $(containerID).append('<h2> Your task list is empty. </h2>')
    }
    addEvents(DataModel, containerID);
}

function ToDoList(containerID){
    this.dataModel = new DataModel();
    this.containerID = containerID;
    this.fillData = fillData(this.dataModel);
    this.initialize = initialize(this.dataModel, this.containerID);
}