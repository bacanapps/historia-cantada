# Git Production Deployment Setup - História Cantada

This guide provides step-by-step instructions for setting up automatic deployment to a production server when pushing changes via Git.

## Overview

This setup allows you to deploy the História Cantada PWA to a production server by pushing to a Git remote. The deployment is triggered automatically via a Git post-receive hook.

**Architecture:**
- Local repository → Push to production remote
- Production server receives push → Triggers post-receive hook
- Hook checks out files to web server directory

**Production URL:** https://historia-cantada.bebot.co/

## Prerequisites

- SSH access to production server (root@173.249.16.84)
- Git installed on production server
- Web server configured (nginx/Apache)
- Domain configured: historia-cantada.bebot.co

## Part 1: Local Setup

### Step 1: Navigate to Project Directory

```bash
cd "/Users/cpantin/Library/CloudStorage/GoogleDrive-colin@cpantin.com/My Drive/@Ministério da Saúde/OPAS 2026/40 anos da aids/dv_2025_cli/historia-cantada"
```

### Step 2: Add Production Remote

Using the SSH config alias:

```bash
git remote add production contabo:/var/repo/historia-cantada.git
```

**Note:** If you have an SSH config alias set up (like `contabo` pointing to `root@173.249.16.84`), use that instead of the full SSH URL for convenience.

### Step 3: Verify Remotes

```bash
git remote -v
```

Expected output:
```
origin      https://github.com/bacanapps/historia-cantada.git (fetch)
origin      https://github.com/bacanapps/historia-cantada.git (push)
production  contabo:/var/repo/historia-cantada.git (fetch)
production  contabo:/var/repo/historia-cantada.git (push)
```

## Part 2: Server Setup (Required Steps)

### Step 1: Connect to Production Server

```bash
ssh root@173.249.16.84
# Or using SSH alias:
ssh contabo
```

### Step 2: Create Bare Git Repository

A bare repository stores Git metadata without a working directory. It acts as a central hub for receiving pushes.

```bash
# Create directory for Git repositories (if not exists)
mkdir -p /var/repo

# Navigate to the directory
cd /var/repo

# Initialize bare repository for História Cantada
git init --bare historia-cantada.git
```

**Why bare repository?**
- Designed to receive pushes from multiple sources
- Doesn't have a working directory (only Git metadata)
- Standard practice for server-side Git repositories

### Step 3: Verify Deployment Directory

The deployment directory should already exist if the site is currently hosted:

```bash
# Check if directory exists
ls -la /var/www/historia-cantada

# If it doesn't exist, create it
mkdir -p /var/www/historia-cantada

# Set appropriate permissions
chown -R www-data:www-data /var/www/historia-cantada
```

### Step 4: Create Post-Receive Hook

The post-receive hook is a script that runs automatically after Git receives a push.

**IMPORTANT:** Use POSIX-compliant syntax with single brackets `[` instead of double brackets `[[` to ensure compatibility.

```bash
# Create the hook file using cat with heredoc
cat > /var/repo/historia-cantada.git/hooks/post-receive << 'EOF'
#!/bin/bash

# Configuration
TARGET="/var/www/historia-cantada"
GIT_DIR="/var/repo/historia-cantada.git"
BRANCH="main"

echo "===== Post-Receive Hook Started ====="

while read oldrev newrev ref
do
    # Extract branch name from ref
    RECEIVED_BRANCH=$(echo $ref | sed 's/refs\/heads\///')

    echo "Received push to branch: $RECEIVED_BRANCH"

    # Check if this is the main branch (use single brackets for POSIX compliance)
    if [ "$RECEIVED_BRANCH" = "$BRANCH" ]; then
        echo "Deploying $BRANCH branch to production..."
        echo "Target directory: $TARGET"

        # Checkout files to deployment directory
        git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH

        if [ $? -eq 0 ]; then
            echo "✓ Deployment successful!"
            echo "Files deployed to: $TARGET"

            # Set permissions
            chown -R www-data:www-data $TARGET

            echo "Service worker will be updated on next visit"
            echo "Site available at: https://historia-cantada.bebot.co/"
        else
            echo "✗ Deployment failed!"
            exit 1
        fi
    else
        echo "Ignoring push to $RECEIVED_BRANCH branch (not $BRANCH)"
    fi
done

echo "===== Post-Receive Hook Completed ====="
EOF
```

**Note:** História Cantada is a **vanilla JavaScript React app with no build step**, making deployment simple and straightforward.

### Step 5: Make Hook Executable

```bash
chmod +x /var/repo/historia-cantada.git/hooks/post-receive
```

**Verify permissions:**
```bash
ls -l /var/repo/historia-cantada.git/hooks/post-receive
```

Should show: `-rwxr-xr-x` (executable)

### Step 6: Set Directory Permissions

```bash
# Git repository permissions
chown -R root:root /var/repo/historia-cantada.git

# Web directory permissions (adjust user:group for your web server)
chown -R www-data:www-data /var/www/historia-cantada

# Make directories readable
chmod -R 755 /var/www/historia-cantada
```

**User/Group options:**
- Ubuntu/Debian nginx: `www-data:www-data`
- CentOS/RHEL nginx: `nginx:nginx`
- Apache: `www-data:www-data` or `apache:apache`

### Step 7: Verify Web Server Configuration

Check if nginx is configured for historia-cantada.bebot.co:

```bash
# Check for existing configuration
ls -la /etc/nginx/sites-available/ | grep historia

# View the configuration
cat /etc/nginx/sites-available/historia-cantada.bebot.co
# Or check sites-enabled
cat /etc/nginx/sites-enabled/historia-cantada.bebot.co
```

**Expected nginx configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name historia-cantada.bebot.co;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name historia-cantada.bebot.co;

    # SSL certificates (adjust paths as needed)
    ssl_certificate /etc/letsencrypt/live/historia-cantada.bebot.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/historia-cantada.bebot.co/privkey.pem;

    root /var/www/historia-cantada;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (especially important for large audio files)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|mp3)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker and manifest should not be cached
    location ~* (sw\.js|manifest\.json)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Increase client max body size for large audio file uploads
    client_max_body_size 100M;
}
```

If configuration doesn't exist, create it and enable:

```bash
nano /etc/nginx/sites-available/historia-cantada.bebot.co
# Paste configuration above

# Enable site
ln -s /etc/nginx/sites-available/historia-cantada.bebot.co /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

### Step 8: Test Connection from Local Machine

Exit the SSH session and return to your local machine:

```bash
exit
```

Test SSH connection:
```bash
ssh contabo "echo 'Connection successful'"
```

## Part 3: Deploying Changes

### Simple Deployment (No Build Step Required)

História Cantada is a vanilla JavaScript app with no build step. This makes deployment very simple!

### Option 1: Push to Production Only

```bash
git push production main
```

### Option 2: Push to GitHub Only

```bash
git push origin main
```

### Option 3: Push to Both Remotes (Recommended)

```bash
# Sequential push
git push origin main && git push production main
```

### Complete Deployment Workflow

```bash
# 1. Navigate to project
cd "/Users/cpantin/Library/CloudStorage/GoogleDrive-colin@cpantin.com/My Drive/@Ministério da Saúde/OPAS 2026/40 anos da aids/dv_2025_cli/historia-cantada"

# 2. Make changes to your code
# Edit files as needed (app.js, data/songs.json, data/tracks.json, etc.)

# 3. Stage all changes
git add .

# 4. Commit changes
git commit -m "Add new songs and update presentation"

# 5. Push to both GitHub and production
git push origin main && git push production main

# 6. Verify deployment
curl -I https://historia-cantada.bebot.co/
open https://historia-cantada.bebot.co/
```

### Option 4: Push to Multiple Remotes at Once

```bash
# Add to .git/config
git config -e
```

Add this section:

```ini
[remote "all"]
    url = https://github.com/bacanapps/historia-cantada.git
    url = contabo:/var/repo/historia-cantada.git
```

Then push to both:
```bash
git push all main
```

### Git Alias for Easy Deployment

Add to `~/.gitconfig`:

```ini
[alias]
    deploy = "!git push origin main && git push production main"
```

Then use:
```bash
git deploy
```

## Workflow Example

**Complete deployment workflow:**

```bash
# 1. Navigate to project
cd "/Users/cpantin/Library/CloudStorage/GoogleDrive-colin@cpantin.com/My Drive/@Ministério da Saúde/OPAS 2026/40 anos da aids/dv_2025_cli/historia-cantada"

# 2. Make changes to your code
# Examples:
# - Edit data/songs.json to add new songs
# - Edit data/tracks.json to update audio tracks
# - Update data/presentation.json for intro content
# - Modify app.js for functionality changes

# 3. Stage changes
git add .

# 4. Commit changes
git commit -m "Add 1990s AIDS awareness songs"

# 5. Deploy to production (no build step!)
git push origin main && git push production main

# 6. Verify deployment
curl -I https://historia-cantada.bebot.co/
open https://historia-cantada.bebot.co/
```

## Working with Audio Files

História Cantada features extensive audio content. Here are best practices:

### Adding New Audio Files

```bash
# 1. Add MP3 files to assets/audio/
cp new-song.mp3 assets/audio/

# 2. Update data/songs.json or data/tracks.json
nano data/songs.json

# 3. Ensure paths are relative
# ✓ Correct: "./assets/audio/new-song.mp3"
# ✗ Wrong: "/assets/audio/new-song.mp3"

# 4. Test locally first
python -m http.server 8000
open http://localhost:8000

# 5. Commit and deploy
git add .
git commit -m "Add new song: [Song Title]"
git push origin main && git push production main
```

### Audio File Best Practices

- **Format:** MP3 format for best browser compatibility
- **Bitrate:** 128-192 kbps for good quality/size balance
- **File size:** Keep individual files under 10MB when possible
- **Naming:** Use descriptive, lowercase names with hyphens: `song-title-year.mp3`
- **Metadata:** Include duration in JSON: `"durationSec": 180`

### Checking Audio Deployment

```bash
# Verify audio files were deployed
ssh contabo "ls -lh /var/www/historia-cantada/assets/audio/ | tail -20"

# Check specific audio file
ssh contabo "ls -lh /var/www/historia-cantada/assets/audio/your-song.mp3"

# Test audio file is accessible
curl -I https://historia-cantada.bebot.co/assets/audio/your-song.mp3
```

## Troubleshooting

### Issue: Permission Denied

**Error:**
```
Permission denied (publickey,password)
```

**Solution:**
- Ensure SSH key is added to server's `~/.ssh/authorized_keys`
- Verify SSH config alias is working: `ssh contabo "echo test"`

### Issue: Hook Not Executing

**Error:**
Hook runs but files aren't deployed

**Solutions:**
```bash
# Check hook is executable
ssh contabo "ls -l /var/repo/historia-cantada.git/hooks/post-receive"

# Check hook syntax
ssh contabo "bash -n /var/repo/historia-cantada.git/hooks/post-receive"

# View hook contents
ssh contabo "cat /var/repo/historia-cantada.git/hooks/post-receive"
```

### Issue: Files Not Updating

**Possible causes:**
1. Wrong TARGET path in hook
2. Permission issues
3. Wrong branch name
4. Browser caching old files

**Debug:**
```bash
# Check current deployment
ssh contabo "ls -la /var/www/historia-cantada"

# Check file modification times
ssh contabo "stat /var/www/historia-cantada/index.html"

# Check specific file content
ssh contabo "head -20 /var/www/historia-cantada/app.js"

# Manually trigger deployment
ssh contabo "cd /var/repo/historia-cantada.git && GIT_DIR=/var/repo/historia-cantada.git git --work-tree=/var/www/historia-cantada checkout -f main"
```

### Issue: Audio Files Not Playing

**Common causes and solutions:**

1. **Incorrect file paths:**
```bash
# Check data JSON files
cat data/songs.json | grep audioSrc
cat data/tracks.json | grep audioSrc

# Ensure paths start with ./
# ✓ "./assets/audio/song.mp3"
# ✗ "/assets/audio/song.mp3"
# ✗ "assets/audio/song.mp3"
```

2. **Missing audio files:**
```bash
# Verify files exist on server
ssh contabo "ls -la /var/www/historia-cantada/assets/audio/"

# Check specific file
ssh contabo "test -f /var/www/historia-cantada/assets/audio/your-song.mp3 && echo 'EXISTS' || echo 'MISSING'"
```

3. **File permissions:**
```bash
# Check audio file permissions
ssh contabo "ls -l /var/www/historia-cantada/assets/audio/your-song.mp3"

# Should be readable: -rw-r--r--

# Fix permissions if needed
ssh contabo "chmod 644 /var/www/historia-cantada/assets/audio/*.mp3"
```

4. **Large file issues:**
```bash
# Check nginx client_max_body_size setting
ssh contabo "grep client_max_body_size /etc/nginx/sites-available/historia-cantada.bebot.co"

# Should be at least 100M for large audio files
```

5. **CORS or MIME type issues:**
```bash
# Check nginx serves correct MIME type for MP3
ssh contabo "grep -r 'audio/mpeg' /etc/nginx/"

# Test file is accessible
curl -I https://historia-cantada.bebot.co/assets/audio/test.mp3
```

### Issue: Site Not Accessible

**Check SSL/Domain:**
```bash
# Test domain resolution
dig historia-cantada.bebot.co

# Check nginx status
ssh contabo "systemctl status nginx"

# Check nginx error logs
ssh contabo "tail -50 /var/log/nginx/error.log"

# Check nginx access logs
ssh contabo "tail -50 /var/log/nginx/access.log | grep historia-cantada"

# Test SSL certificate
curl -I https://historia-cantada.bebot.co/
openssl s_client -connect historia-cantada.bebot.co:443 -servername historia-cantada.bebot.co
```

### Issue: Service Worker Caching Old Files

**Solution:**
Update version in `sw.js` to force cache refresh:

```javascript
const VERSION = "v2";  // Increment this
```

Then commit and push:
```bash
git add sw.js
git commit -m "Update service worker version"
git push origin main && git push production main
```

**Clear browser cache:**
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Or use incognito/private mode

### Issue: Data Files Not Loading

**Check JSON syntax:**
```bash
# Validate songs.json
python3 -m json.tool data/songs.json > /dev/null && echo "Valid" || echo "Invalid"

# Validate tracks.json
python3 -m json.tool data/tracks.json > /dev/null && echo "Valid" || echo "Invalid"

# Validate presentation.json
python3 -m json.tool data/presentation.json > /dev/null && echo "Valid" || echo "Invalid"

# Check for common issues
grep -n "," data/songs.json | tail -5  # Trailing commas
```

## Security Considerations

### 1. Use SSH Keys (Recommended)

```bash
# Generate SSH key locally (if not already done)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to server
ssh-copy-id root@173.249.16.84
# Or using alias:
ssh-copy-id contabo
```

### 2. Restrict Hook Permissions

```bash
# Hook should only be writable by root
ssh contabo "chmod 755 /var/repo/historia-cantada.git/hooks/post-receive"
ssh contabo "chown root:root /var/repo/historia-cantada.git/hooks/post-receive"
```

### 3. HTTPS Configuration

Ensure SSL certificates are properly configured:

```bash
# Check SSL certificate expiry
ssh contabo "certbot certificates"

# Renew certificates if needed
ssh contabo "certbot renew"

# Test SSL configuration
openssl s_client -connect historia-cantada.bebot.co:443 -servername historia-cantada.bebot.co
```

### 4. Protect Audio Files from Hotlinking

Add to nginx configuration to prevent bandwidth theft:

```nginx
location ~* \.(mp3)$ {
    valid_referers none blocked server_names *.bebot.co;
    if ($invalid_referer) {
        return 403;
    }
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 5. Restrict SSH Access

Edit `/etc/ssh/sshd_config` to restrict access (be careful not to lock yourself out):

```bash
# Only allow specific users
AllowUsers deployer

# Disable root login (optional, be careful)
PermitRootLogin no

# Restart SSH
systemctl restart sshd
```

## Monitoring Deployments

### View Hook Logs

Add logging to hook (optional enhancement):

```bash
#!/bin/bash
LOG_FILE="/var/log/historia-cantada-deploy.log"

# Redirect all output to log
exec >> $LOG_FILE 2>&1

echo "===== Deployment started at $(date) ====="
# ... rest of hook ...
echo "===== Deployment completed at $(date) ====="
```

View logs:
```bash
ssh contabo "tail -f /var/log/historia-cantada-deploy.log"
```

### Monitor Site Status

```bash
# Check site is responding
curl -I https://historia-cantada.bebot.co/

# Monitor nginx access logs
ssh contabo "tail -f /var/log/nginx/access.log | grep historia-cantada"

# Check site uptime
curl -o /dev/null -s -w "Time: %{time_total}s\nHTTP: %{http_code}\n" https://historia-cantada.bebot.co/

# Monitor audio file downloads
ssh contabo "tail -f /var/log/nginx/access.log | grep '\.mp3'"
```

### Monitor Disk Space (Important for Audio Files)

```bash
# Check disk space usage
ssh contabo "df -h /var/www/historia-cantada"

# Check audio directory size
ssh contabo "du -sh /var/www/historia-cantada/assets/audio/"

# List largest audio files
ssh contabo "du -h /var/www/historia-cantada/assets/audio/*.mp3 | sort -h | tail -10"
```

## Advanced: Hook Enhancements

### Add Deployment Notifications

Send notification when deployment completes:

```bash
#!/bin/bash
TARGET="/var/www/historia-cantada"
GIT_DIR="/var/repo/historia-cantada.git"
BRANCH="main"
DEPLOY_LOG="/var/log/historia-cantada-deploy.log"

while read oldrev newrev ref
do
    RECEIVED_BRANCH=$(echo $ref | sed 's/refs\/heads\///')

    if [ "$RECEIVED_BRANCH" = "$BRANCH" ]; then
        echo "Deploying $BRANCH branch at $(date)..." | tee -a $DEPLOY_LOG

        git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH

        if [ $? -eq 0 ]; then
            echo "✓ Deployment successful at $(date)" | tee -a $DEPLOY_LOG
            chown -R www-data:www-data $TARGET

            # Count audio files
            AUDIO_COUNT=$(ls $TARGET/assets/audio/*.mp3 2>/dev/null | wc -l)
            echo "Audio files deployed: $AUDIO_COUNT" | tee -a $DEPLOY_LOG

            # Optional: Send email notification
            # echo "Deployed to historia-cantada.bebot.co - $AUDIO_COUNT audio files" | mail -s "Deployment Success" admin@example.com
        else
            echo "✗ Deployment failed at $(date)" | tee -a $DEPLOY_LOG
            exit 1
        fi
    fi
done
```

### Pre-deployment Validation

Add validation before deploying:

```bash
#!/bin/bash
TARGET="/var/www/historia-cantada"
GIT_DIR="/var/repo/historia-cantada.git"
BRANCH="main"
TMP_WORK="/tmp/historia-cantada-test"

while read oldrev newrev ref
do
    RECEIVED_BRANCH=$(echo $ref | sed 's/refs\/heads\///')

    if [ "$RECEIVED_BRANCH" = "$BRANCH" ]; then
        echo "Running pre-deployment validation..."

        # Checkout to temporary directory
        mkdir -p $TMP_WORK
        git --work-tree=$TMP_WORK --git-dir=$GIT_DIR checkout -f $BRANCH

        # Validate required files exist
        REQUIRED_FILES=("index.html" "app.js" "data/songs.json" "data/tracks.json" "data/presentation.json")
        for file in "${REQUIRED_FILES[@]}"; do
            if [ ! -f "$TMP_WORK/$file" ]; then
                echo "ERROR: Required file missing: $file"
                rm -rf $TMP_WORK
                exit 1
            fi
        done

        # Validate JSON syntax
        if ! python3 -m json.tool $TMP_WORK/data/songs.json > /dev/null 2>&1; then
            echo "ERROR: Invalid JSON in data/songs.json!"
            rm -rf $TMP_WORK
            exit 1
        fi

        if ! python3 -m json.tool $TMP_WORK/data/tracks.json > /dev/null 2>&1; then
            echo "ERROR: Invalid JSON in data/tracks.json!"
            rm -rf $TMP_WORK
            exit 1
        fi

        if ! python3 -m json.tool $TMP_WORK/data/presentation.json > /dev/null 2>&1; then
            echo "ERROR: Invalid JSON in data/presentation.json!"
            rm -rf $TMP_WORK
            exit 1
        fi

        echo "✓ Validation passed"

        # Deploy
        git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH
        chown -R www-data:www-data $TARGET

        # Cleanup
        rm -rf $TMP_WORK
        echo "✓ Deployment complete!"
    fi
done
```

## Data File Structure

História Cantada uses multiple JSON data files:

### data/songs.json
```json
[
  {
    "id": "song-1",
    "title": "Song Title",
    "artist": "Artist Name",
    "year": "1985",
    "audioSrc": "./assets/audio/song-file.mp3",
    "durationSec": 180,
    "description": "Song description...",
    "tags": ["tag1", "tag2"]
  }
]
```

### data/tracks.json
```json
[
  {
    "id": "track-1",
    "title": "Track Title",
    "audioSrc": "./assets/audio/track-file.mp3",
    "durationSec": 120
  }
]
```

### data/presentation.json
```json
{
  "title": "História Cantada da AIDS",
  "subtitle": "Subtitle text",
  "introText": "Introduction...",
  "audioSrc": "./assets/audio/intro.mp3"
}
```

## Resources

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Deploying with Git](https://git-scm.com/book/en/v2/Git-on-the-Server-Getting-Git-on-a-Server)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Howler.js Audio Documentation](https://howlerjs.com/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

## Summary Checklist

Server setup:
- [ ] SSH access confirmed
- [ ] Bare repository created at `/var/repo/historia-cantada.git`
- [ ] Deployment directory verified at `/var/www/historia-cantada`
- [ ] Post-receive hook created and made executable
- [ ] Permissions set correctly
- [ ] Web server configured for historia-cantada.bebot.co
- [ ] SSL certificates configured
- [ ] Audio files directory verified
- [ ] First deployment tested

Local setup:
- [ ] Production remote added
- [ ] Audio files organized in assets/audio/
- [ ] Data JSON files validated
- [ ] Test deployment completed
- [ ] Deployment workflow documented

Verification:
- [ ] Site accessible at https://historia-cantada.bebot.co/
- [ ] All audio files playing correctly
- [ ] Service worker functioning
- [ ] Analytics tracking working
- [ ] All songs and tracks displaying correctly
- [ ] Presentation content loading

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review hook logs if logging is enabled
3. Test manual deployment via SSH
4. Verify web server and SSL configuration
5. Check domain DNS settings
6. Validate JSON data files
7. Test audio file accessibility

## Quick Reference

```bash
# Complete deployment (no build step needed!)
git add . && git commit -m "Update" && git push origin main && git push production main

# Check deployment
ssh contabo "ls -la /var/www/historia-cantada"

# View site
open https://historia-cantada.bebot.co/

# Check audio files
ssh contabo "ls -lh /var/www/historia-cantada/assets/audio/"

# Validate JSON
python3 -m json.tool data/songs.json
python3 -m json.tool data/tracks.json

# Check nginx config
ssh contabo "nginx -t"

# Reload nginx
ssh contabo "systemctl reload nginx"

# Monitor deployments
ssh contabo "tail -f /var/log/historia-cantada-deploy.log"

# Check disk space
ssh contabo "df -h /var/www/historia-cantada"
```

## Project Features

História Cantada is unique among the PWA collection:

**Key Features:**
- **Musical history:** Chronicle of AIDS awareness through songs
- **Extensive audio library:** Multiple songs and audio tracks
- **Timeline view:** Songs organized by year/decade
- **No build step:** Vanilla JavaScript React app
- **Rich metadata:** Song descriptions, artists, years, tags
- **Audio player:** Powered by Howler.js
- **Offline capability:** Service Worker for offline playback

**Data Files:**
- `songs.json` - Main song database
- `tracks.json` - Additional audio tracks
- `presentation.json` - Introduction and presentation content
- `fsongs.json` - Featured/highlighted songs (if exists)

**Deployment Simplicity:**
Being a vanilla JavaScript app with no build step makes História Cantada **simple to deploy** - just edit, commit, and push!
