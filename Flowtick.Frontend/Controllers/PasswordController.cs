using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class PasswordController : Controller
    {
        public IActionResult Reset()
        {
            return View();
        }
    }
}
