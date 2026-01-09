using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class UserController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public ActionResult SignUp()
        {
            return View();
        }
        public ActionResult CodeVerification()
        {
            return View();
        }
        public ActionResult AccountDetails()
        {
            return View();
        }
        public ActionResult SelectWorkType()
        {
            return View();
        }

        public ActionResult Profile()
        {
            return View();
        }
    }
}
