var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();
string code = Guid.NewGuid().ToString();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=App}/{action=See}/{id?}");

app.Run();
