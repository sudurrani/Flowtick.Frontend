using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers.ESS
{
    public class TimesheetController : Controller
    {
        public IActionResult List()
        {
            return View();
        }
    }
}
