using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class TaskController : Controller
    {
        public IActionResult Detail()
        {
            return View();
        }
    }
}
