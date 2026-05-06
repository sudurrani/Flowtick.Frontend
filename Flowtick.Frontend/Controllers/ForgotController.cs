using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class ForgotController : Controller
    {
        public IActionResult Password()
        {
            return View();
        }
    }
}
