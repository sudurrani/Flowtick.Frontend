using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class ProjectController : Controller
    {
        [HttpGet]
        public IActionResult Board()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Settings()
        {
            return View();
        }
        [HttpGet]
        public IActionResult Invitation()
        {
            return View();
        }
        [HttpGet]
        public IActionResult Backlog()
        {
            return View();
        }
    }
}
