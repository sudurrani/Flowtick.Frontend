using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class BoardController : Controller
    {
        //private readonly ITaskService _taskService;
        //private readonly IUserService _userService;

        public BoardController()//ITaskService taskService, IUserService userService)
        {
            //_taskService = taskService;
            //_userService = userService;
        }
        public async Task<IActionResult> Project()
        {
            return View();
        }
        public async Task<IActionResult> Index1()
        {
            return View();
        }
        // GET: Board/Index
        public async Task<IActionResult> Index()
        {
            var currentUser = new UserViewModel()
            {
            };
            //await _userService.GetCurrentUserAsync();

            var model = new BoardViewModel
            {
                ProjectName = "App Clone",
                BoardName = "Board",
                CurrentUser = new UserViewModel
                {
                    Id = 1,//currentUser.Id,
                    Name = "Shahid Ullah",//currentUser.Name,
                    Email = "shahid@gmail.com",//currentUser.Email,
                    Initials = GetInitials("Shahid Ullah")
                },
                Columns = new List<BoardColumnViewModel>
                {
                    new BoardColumnViewModel
                    {
                        Id = "todo",
                        Title = "To Do",
                        CssClass = "",
                        Tasks = TaskCardFactory.GenerateTasks() //await _taskService.GetTasksByStatusAsync("ToDo")
        },
                    new BoardColumnViewModel
                    {
                        Id = "inprogress",
                        Title = "In Progress",
                        CssClass = "in-progress",
                        Tasks = TaskCardFactory.GenerateTasks() //await _taskService.GetTasksByStatusAsync("InProgress")
        },
                    new BoardColumnViewModel
                    {
                        Id = "review",
                        Title = "Review",
                        CssClass = "review",
                        Tasks = TaskCardFactory.GenerateTasks() //await _taskService.GetTasksByStatusAsync("Review")
        },
                    new BoardColumnViewModel
                    {
                        Id = "done",
                        Title = "Done",
                        CssClass = "done",
                        Tasks = TaskCardFactory.GenerateTasks() //await _taskService.GetTasksByStatusAsync("Done")
        }
                }
            };

            return View(model);
        }

        // GET: Board/Task/{id}
        public async Task<IActionResult> Task(string id)
        {
            var tasks = TaskCardFactory.GenerateTasks(); //await _taskService.GetTaskByIdAsync(id);

            if (tasks == null)
            {
                return NotFound();
            }

            var currentUser = new UserViewModel()
            {
            };
            //await _userService.GetCurrentUserAsync();
            var task = tasks.FirstOrDefault();
            var model = new TaskDetailViewModel
            {
                TaskId = task.Id,
                Title = task.Title,
                Description = "Description",
                Type = task.Type,
                Status = task.Status,
                Priority = task.Priority,
                Sprint = "task.Sprint",
                Assignee = MapToUserViewModel(task.Assignee),
                Reviewer = MapToUserViewModel(task.Assignee),
                Reporter = MapToUserViewModel(task.Assignee),
                CurrentUser = MapToUserViewModel(currentUser),
                Labels = task.Labels,
                ChildItems = new List<ChildTaskViewModel>(), //await _taskService.GetChildTasksAsync(id),
                Comments = new List<CommentViewModel>(), //await _taskService.GetTaskCommentsAsync(id),
                EstimatedHours = 1,
                LoggedHours = 2,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            return View(model);
        }
        /*
        // POST: Board/UpdateTask
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateTask(TaskDetailViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("Task", model);
            }

            try
            {
                await _taskService.UpdateTaskAsync(model.TaskId, model.Title, model.Description);
                TempData["SuccessMessage"] = "Task updated successfully";
                return RedirectToAction("Task", new { id = model.TaskId });
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An error occurred while updating the task");
                return View("Task", model);
            }
        }
        */
        /*
        // POST: Board/UpdateTaskStatus
        [HttpPost]
        public async Task<IActionResult> UpdateTaskStatus(string taskId, string newStatus)
        {
            try
            {
                await _taskService.UpdateTaskStatusAsync(taskId, newStatus);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }
        */
        // GET: Board/Create
        public IActionResult Create()
        {
            return View();
        }

        /*
        // POST: Board/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateTaskViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            try
            {
                var taskId = await _taskService.CreateTaskAsync(model);
                TempData["SuccessMessage"] = "Task created successfully";
                return RedirectToAction("Task", new { id = taskId });
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An error occurred while creating the task");
                return View(model);
            }
        }
        */
        // POST: Board/AddComment
        /*
        [HttpPost]
        public async Task<IActionResult> AddComment(string taskId, string content)
        {
            try
            {
                var currentUser = TaskCardFactory.GenerateTasks(); //await _userService.GetCurrentUserAsync();
                var comment = TaskCardFactory.GenerateTasks(); //await _taskService.AddCommentAsync(taskId, content, currentUser.Id);

                return Json(new
                {
                    success = true,
                    comment = new
                    {
                        id = comment.Id,
                        content = comment.Content,
                        author = comment.Author.Name,
                        authorInitials = GetInitials(comment.Author.Name),
                        createdDate = comment.CreatedDate.ToString("MMM dd, yyyy hh:mm tt")
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }
        */

        // POST: Board/Search
        [HttpPost]
        public async Task<IActionResult> Search(string query)
        {
            var results = TaskCardFactory.GenerateTasks(); //await _taskService.SearchTasksAsync(query);
            return Json(results);
        }

        // Helper Methods
        private UserViewModel MapToUserViewModel(dynamic user)
        {
            if (user == null) return null;

            return new UserViewModel
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Initials = GetInitials(user.Name)
            };
        }

        public string GetInitials(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return "??";

            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length >= 2)
            {
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            }
            else if (parts.Length == 1 && parts[0].Length >= 2)
            {
                return parts[0].Substring(0, 2).ToUpper();
            }
            else
            {
                return parts[0][0].ToString().ToUpper();
            }
        }
    }

    // Additional ViewModel for Create
    public class CreateTaskViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Priority { get; set; }
        public int AssigneeId { get; set; }
        public string ParentTaskId { get; set; }
        public int? SprintId { get; set; }
    }
    // Models/ViewModels/BoardViewModel.cs

    public class BoardViewModel
    {
        public string ProjectName { get; set; }
        public string BoardName { get; set; }
        public UserViewModel CurrentUser { get; set; }
        public List<BoardColumnViewModel> Columns { get; set; }
    }

    public class BoardColumnViewModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string CssClass { get; set; }
        public List<TaskCardViewModel> Tasks { get; set; }
    }

    public class TaskCardViewModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; } // Epic, Story, Task, Bug
        public string Status { get; set; } //ToDo, InProgress, Review, Done
        public string Priority { get; set; } // High, Medium, Low
        public UserViewModel Assignee { get; set; }
        public List<string> Labels { get; set; }
        public int SubtaskCount { get; set; }
        public int CompletedSubtasks { get; set; }
    }

    public class UserViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Initials { get; set; }
        public string AvatarColor { get; set; }

    }

    // Models/ViewModels/TaskDetailViewModel.cs


    public class TaskDetailViewModel
    {
        public string TaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public string Sprint { get; set; }

        public UserViewModel Assignee { get; set; }
        public UserViewModel Reviewer { get; set; }
        public UserViewModel Reporter { get; set; }
        public UserViewModel CurrentUser { get; set; }

        public List<string> Labels { get; set; }
        public List<ChildTaskViewModel> ChildItems { get; set; }
        public List<CommentViewModel> Comments { get; set; }

        public int? EstimatedHours { get; set; }
        public int? LoggedHours { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class ChildTaskViewModel
    {
        public string TaskId { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public UserViewModel Assignee { get; set; }
    }

    public class CommentViewModel
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public UserViewModel Author { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsEdited { get; set; }
    }
    public static class TaskCardFactory
    {
        public static List<TaskCardViewModel> GenerateTasks()
        {
            var statuses = new[] { "ToDo", "InProgress", "Review", "Done" };
            var types = new[] { "Epic", "Story", "Task", "Bug" };
            var priorities = new[] { "High", "Medium", "Low" };
            var random = new Random();

            var tasks = new List<TaskCardViewModel>();

            foreach (var status in statuses)
            {
                for (int i = 1; i <= 10; i++)
                {
                    var subtaskCount = random.Next(0, 6);
                    var completedSubtasks = status == "Done"
                        ? subtaskCount
                        : random.Next(0, subtaskCount + 1);

                    tasks.Add(new TaskCardViewModel
                    {
                        Id = $"BHA-{random.Next(1, 100)}", //Guid.NewGuid().ToString(),
                        Title = $"{status} Task {i}",
                        Status = status,
                        Type = types[random.Next(types.Length)],
                        Priority = priorities[random.Next(priorities.Length)],
                        Assignee = new UserViewModel
                        {
                            Id = random.Next(1, 6), //Guid.NewGuid().ToString(),
                            Name = $"Shahid Ullah",
                            Initials = GetInitials("Shahid Ullah")
                        },
                        Labels = new List<string>
                    {
                        "frontend",
                        "backend",
                        "api",
                        "ui",
                        "tech-debt"
                    }.OrderBy(_ => random.Next()).Take(2).ToList(),
                        SubtaskCount = subtaskCount,
                        CompletedSubtasks = completedSubtasks
                    });
                }
            }

            return tasks;
        }
        public static string GetInitials(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return "??";

            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length >= 2)
            {
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            }
            else if (parts.Length == 1 && parts[0].Length >= 2)
            {
                return parts[0].Substring(0, 2).ToUpper();
            }
            else
            {
                return parts[0][0].ToString().ToUpper();
            }
        }
    }
}
