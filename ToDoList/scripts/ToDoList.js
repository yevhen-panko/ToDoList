$(document).ready(function() {

	function Task(message, date){
		this.message = message; //Task description message
		if (date) { //If date set in parameter - save value in field date, else create new Date. Date in milliseconds is Task id.
			this.date = new Date(+date).getTime();
		} else this.date = new Date().getTime();
		this.getMessage = function(){
			return this.message;
		};
		this.setMessage = function(message){
			this.message = message;
		};
		this.getThisDate = function(){
			return this.date;
		};
		this.setDate = function(date){
			this.date = date;
		};
		this.printDate = function(){ //Return string Date in format dd.mm.yyyy hh:mm:ss
			return new Date(+this.date).toLocaleString();
		};
	}

	function TaskList(){
		this.taskArray = new Array(); //Array for Tasks
		this.unshiftTask = function(task){ //Add task to beginning Array
			this.taskArray.unshift(task);
		};
		this.pushTask = function(task){ //Add task to ending Array
			this.taskArray.push(task);
		};
		this.getTaskArray = function(){
			if (this.taskArray){
				return this.taskArray;
			} else return false;
		};
		this.setTaskArray = function(array){
			this.taskArray = array;
		}
		/*
			This method print tasks. 
			liClass - class of <li> tag (ActiveTask, CompletedTask, ForeignTask)
			taskTextClass - class of <span> tag to out task message (ActiveTaskText, CompletedTaskText, ForeignTaskText)
			checkedAttr - checked attribute of <input type="checked"> tag to checked/unchecked task
		*/
		this.printTaskList = function(liClass, taskTextClass, checkedAttr){
			if (this.taskArray && this.taskArray.length > 0) {
				for (var i=0; i<this.taskArray.length; i++){
					$("#TaskList").append('<li class="'+liClass+'" id="' + this.taskArray[i].getThisDate() + '">'+
					'<span class="'+taskTextClass+'">' + this.taskArray[i].getMessage() + '<br>' +
					'<span class="TaskDate"> ' + this.taskArray[i].printDate() + '</span> </span>'+
					'<img src="images/delete.png" class="DeleteTask">'+
					'<input type="checkbox" class="CheckTask"'+checkedAttr+'> </li>');
				}
			} else return false;
		};
	}
	
	function ActiveTaskList(){}; //List for active tasks
	function CompletedTaskList(){}; //List for completed tasks
	function ForeignTaskList(){}; //List for tasks to other users
	
	ActiveTaskList.prototype = new TaskList();
	CompletedTaskList.prototype = new TaskList();
	ForeignTaskList.prototype = new TaskList();
	
	//This method fill taskArray from JSON.
	function parseString(stringForParsing, TaskList){
		var currentPosition = 0;
		var index = 0;
		var message = "";
		var date = "";
		while(stringForParsing.indexOf(":", currentPosition+1) > currentPosition){
			index = stringForParsing.indexOf(":", currentPosition+1);
			message = stringForParsing.substring(index+2, stringForParsing.indexOf('"', index+2));
			currentPosition = index;
			index = stringForParsing.indexOf(":", currentPosition+1);
			date = new Date(+stringForParsing.substring(index+1, stringForParsing.indexOf('}', index))).getTime();
			var task = new Task(message);
			task.setDate(date);
			TaskList.pushTask(task);
			currentPosition = index;
		}
	}
		
	function fillData(){
		this.activeTasks = new ActiveTaskList();
		this.completedTasks = new CompletedTaskList();
		this.foreignTaskList = new ForeignTaskList();
		
		if ((typeof localStorage !=="undefined") && ((localStorage.getItem("Active") && localStorage.getItem("Active").length > 2) || 
			(localStorage.getItem("Completed") && localStorage.getItem("Completed").length > 2))){
			var item = localStorage.getItem("Active");
			parseString(item, activeTasks);
			if (localStorage.getItem("Completed")){
				item = localStorage.getItem("Completed");
				parseString(item, completedTasks);
			}	
		} else {
			activeTasks.unshiftTask(new Task("Add field user_name to Task constructor", "1368790693344"));
			activeTasks.unshiftTask(new Task("Add label important. This will be something about priority", "1368790659344"));
			completedTasks.unshiftTask(new Task("Add 'delete all completed tasks' button", "1368791760404"));
		}
	}
	
	function addEvents(){
		function findMaxCount(){
			if (activeTasks.getTaskArray().length >= completedTasks.getTaskArray().length){
				return activeTasks.getTaskArray().length;
			} else return completedTasks.getTaskArray().length;
		};
		
		function setListsToLocalStorage(){
			if (typeof localStorage !=="undefined"){
			localStorage.setItem("Active", JSON.stringify(activeTasks.getTaskArray()));
			localStorage.setItem("Completed", JSON.stringify(completedTasks.getTaskArray()));
			} else return false;
		};
		
		$(document).keypress(function(event){
			if (event.keyCode == 27){
				initialize();
			}
		});
		
		$(".ActiveTask, .CompletedTask").hover(
			function(){
				$(this).addClass("Selected");
				$(".CheckTask", this).fadeIn();
				$(".DeleteTask", this).fadeIn();
			},
			function(){
				$(this).removeClass("Selected");
				$(".CheckTask", this).fadeOut();
				$(".DeleteTask", this).fadeOut();
			}
		);
		
		$(".DeleteTask").click(function(){
			var count = findMaxCount();
			var $id = $(this).parent().attr("id");
			if (confirm("Are you really want to delete this task?")) {
				for (var i=0; i<count; i++){
					if (activeTasks.getTaskArray().length > i && activeTasks.getTaskArray()[i].getThisDate() == $id){
						activeTasks.getTaskArray().splice(i, 1);
						setListsToLocalStorage();
						break;
					} else if (completedTasks.getTaskArray().length > i && completedTasks.getTaskArray()[i].getThisDate() == $id) {
						completedTasks.getTaskArray().splice(i, 1);
						setListsToLocalStorage();
						break;
					};
				};
			};
			initialize();
		});
		
		$(".CheckTask").click(function(){
			var count = findMaxCount();
			var $id = $(this).parent().attr("id");
			
			if ($(this).attr("checked")){
				$(this).removeAttr("checked");
			} else $(this).attr("checked", "checked");
			
			for (var i=0; i<count; i++){
				if (activeTasks.getTaskArray().length > i && activeTasks.getTaskArray()[i].getThisDate() == $id){
					completedTasks.unshiftTask(activeTasks.getTaskArray()[i]);
					activeTasks.getTaskArray().splice(i, 1);
					break;
				} else if (completedTasks.getTaskArray().length > i && completedTasks.getTaskArray()[i].getThisDate() == $id){
					activeTasks.unshiftTask(completedTasks.getTaskArray()[i]);
					completedTasks.getTaskArray().splice(i, 1);
					break;
				}
			}
			setListsToLocalStorage();
			initialize();
		});
		
		$("#NewTaskMessage").keydown(function(){
			if ($.trim($(this).val()).length > 0){
				$("#AddButton").removeAttr("disabled");
			}
		}).keyup(function(){
			if ($.trim($(this).val()).length == 0){
				$("#AddButton").attr("disabled", true);
			}
		});
		
		$("#AddTaskForm").submit(function(){
			activeTasks.unshiftTask(new Task($("#NewTaskMessage").val()));
			setListsToLocalStorage();
			initialize();
			$("#AddButton").attr("disabled", true);
		});
		
		$(".ActiveTaskText").dblclick(function(){
			var count = findMaxCount();
			var $id = $(this).parent().attr("id");
			
			for (var i=0; i<count; i++){
				if (activeTasks.getTaskArray().length > i && activeTasks.getTaskArray()[i].getThisDate() == $id){
					$(this).parent().empty().append('<textarea id="TaskEdit" cols="50">'+activeTasks.getTaskArray()[i].getMessage()+
						'</textarea><input type="button" id="SaveButton" value="Save">');
					$("#SaveButton").click(function(){
						activeTasks.getTaskArray()[i].setMessage($("#TaskEdit").val());
						setListsToLocalStorage();
						initialize();
					});
					break;
				}
			}
		});
		
		$("#DeleteAllCompletedTaskButton").click(function(){
			completedTasks.getTaskArray().length = 0;
			setListsToLocalStorage();
			initialize();
		});
	}
	
	function initialize(){
		$("#tabs-1").empty().append('<form id="AddTaskForm" action="#"><table><tr>' +
							'<td><textarea rows="5" cols="25" id="NewTaskMessage"></textarea> </td>' +
							'<td> <input type="submit" value="Add Task" id="AddButton" disabled="true"> </td>' +
							'</table></form>');
		if (activeTasks.getTaskArray().length > 0 || completedTasks.getTaskArray().length > 0){
			$("#tabs-1").append('<ol id="TaskList"></ol>');
			activeTasks.printTaskList('ActiveTask','ActiveTaskText','');
			completedTasks.printTaskList('CompletedTask', 'CompletedTaskText','checked="checked"');
			$("#tabs-1").append('<input type="button" id="DeleteAllCompletedTaskButton" value="Delete all completed tasks">');
			if (completedTasks.getTaskArray().length > 0){
				$("#DeleteAllCompletedTaskButton").fadeIn(0);
			} else $("#DeleteAllCompletedTaskButton").fadeOut();
		} else {
			$("#tabs-1").append('<h2> Your task list is empty. </h2>')
		}
		addEvents();
	}
	
	fillData();
	initialize();
})