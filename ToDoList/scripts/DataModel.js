function Task(message, date, userName) {
    this.message = message; //Task description message
    //If date set in parameter - save value in field date, else create new Date. Date in milliseconds is Task id.
    if (date) {
        this.date = new Date(+date).toLocaleString(); //This date is using in template
        this.dateInMilliseconds = new Date(+date).getTime(); //This date is using as taskID
    } else {
        this.date = new Date().toLocaleString();
        this.dateInMilliseconds = new Date().getTime();
    }
    this.userName = userName;
    this.setUserName = function (userName) {
        this.userName = userName;
    };
    this.getMessage = function () {
        return this.message;
    };
    this.setMessage = function (message) {
        this.message = message;
    };
    this.getDateInMilliseconds = function () {
        return this.dateInMilliseconds;
    };
    this.setDate = function (date) {
        this.date = new Date(+date).toLocaleString();
        this.dateInMilliseconds = new Date(+date).getTime();
    };
}

function TaskList() {
    this.taskArray = []; //Array for Tasks
    this.addFirst = function (task) { //Add task to beginning Array
        this.taskArray.unshift(task);
    };
    this.addLast = function (task) { //Add task to ending Array
        this.taskArray.push(task);
    };
    this.getTaskArray = function () {
        if (this.taskArray) {
            return this.taskArray;
        } else return false;
    };
}

function DataModel(){
    this.activeTasks = new TaskList();
    this.completedTasks = new TaskList();
    this.foreignTasks = new TaskList();
}