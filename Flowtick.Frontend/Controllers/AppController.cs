using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class AppController : Controller
    {
        public IActionResult See(long? id, string? code)
        {
            return View();
        }
        public IActionResult YellowTheme()
        {
            return PartialView("~/Views/Shared/PartialViews/WebsiteTheme/_YellowThemePartialView.cshtml");
        }

        public IActionResult DarkTheme()
        {
            return PartialView("~/Views/Shared/PartialViews/WebsiteTheme/_DarkThemePartialView.cshtml");
        }

    }
}
