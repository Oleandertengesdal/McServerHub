# McServerHub

A hybrid Minecraft hosting service combining a web admin panel with secure SSH client access. Manage your homelab-hosted Minecraft server directly through a web interface or SSH client.

## Project Structure

- **backend/** - REST API and server management logic
- **frontend/** - Web admin dashboard and interface
- **client/** - SSH client application for direct server access
- **secrets/** - Configuration and credentials (not versioned)

See individual component READMEs for detailed documentation.

## Security

All sensitive files (`.env`, SSH keys, certificates, API secrets) are excluded from version control. Configure them locally before deployment.