using Childsafenet.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Childsafenet.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<ScanLog> ScanLogs => Set<ScanLog>();
    public DbSet<UrlDataset> UrlDatasets => Set<UrlDataset>();
    public DbSet<UrlFeedback> UrlFeedbacks => Set<UrlFeedback>();
    public DbSet<ModelRegistry> ModelRegistries => Set<ModelRegistry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(x => x.Settings)
            .WithOne(x => x.User)
            .HasForeignKey<UserSettings>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}