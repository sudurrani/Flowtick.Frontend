using Flowtick.Frontend.Models.SignUp;
using Microsoft.AspNetCore.Mvc;

namespace Flowtick.Frontend.Controllers
{
    public class AuthController : Controller
    {
        [HttpGet]
        public IActionResult SignUp()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public IActionResult GetPartialView([FromBody] GetPartialViewInputViewModel getPartialViewInputViewModel) 
        {
            return PartialView(getPartialViewInputViewModel.url);
        }
    }    
}
