# Expense Tracker - CI/CD Pipeline with Jenkins

A complete CI/CD pipeline implementation for an Expense Tracker web application using Jenkins, Docker, Selenium, and AWS EC2.

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Pipeline Stages](#pipeline-stages)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Application Features
- ➕ Add expenses with title, amount, category, and date
- 📊 View expense statistics by category
- 🗑️ Delete expenses
- 💾 JSON file-based persistence (no database required)
- 🎨 Modern, responsive UI with dark theme
- 🐳 Fully containerized

### CI/CD Features
- 🔄 Automated build on Git push
- 🔍 Code linting with ESLint
- 🧪 Automated Selenium testing
- 🐋 Docker containerization
- 📦 Automated deployment
- 📊 Pipeline visualization

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│   Jenkins    │─────▶│   AWS EC2   │
│  Repository │      │   Pipeline   │      │   (Docker)  │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             │
                     ┌───────▼────────┐
                     │  Docker Images │
                     ├────────────────┤
                     │ • Application  │
                     │ • Selenium     │
                     └────────────────┘
```

## 🔧 Prerequisites

- AWS Account with EC2 access
- GitHub account
- SSH key pair for EC2
- Basic knowledge of:
  - Linux commands
  - Docker
  - Git
  - Jenkins

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-username/expense-tracker-cicd.git
cd expense-tracker-cicd
```

### 2. AWS EC2 Setup

```bash
# Launch Ubuntu 22.04 t2.medium instance
# Configure Security Groups:
# - Port 22 (SSH)
# - Port 8080 (Jenkins & App)

# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java
sudo apt install openjdk-17-jdk -y

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins -y

# Install Docker
sudo apt install docker.io -y
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 4. Configure Jenkins

1. Access Jenkins: `http://your-ec2-ip:8080`
2. Get initial password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install suggested plugins
4. Create admin user

### 5. Install Jenkins Plugins

Go to: Manage Jenkins → Manage Plugins → Available

Install:
- Docker Pipeline
- GitHub Integration
- Pipeline
- Git Plugin

### 6. Create Jenkins Pipeline

1. New Item → Pipeline → `expense-tracker-pipeline`
2. Configure:
   - GitHub project URL: `https://github.com/your-username/expense-tracker-cicd`
   - Build Triggers: ✓ GitHub hook trigger
   - Pipeline: Script from SCM
   - SCM: Git
   - Repository URL: Your repo URL
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

### 7. Setup GitHub Webhook

1. Go to GitHub repo → Settings → Webhooks
2. Add webhook:
   - Payload URL: `http://your-ec2-ip:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Just the push event

### 8. Trigger Pipeline

```bash
# Make a change and push
echo "# Test" >> README.md
git add .
git commit -m "Test pipeline"
git push origin main
```

Pipeline will automatically start!

## 📁 Project Structure

```
expense-tracker-cicd/
├── app.js                    # Main application
├── package.json              # Node.js dependencies
├── Dockerfile                # Application container
├── Dockerfile.selenium       # Test container
├── Jenkinsfile              # CI/CD pipeline
├── selenium_tests.py        # Test cases
├── .eslintrc.json           # Linting rules
├── docker-compose.yml       # Local testing
└── README.md                # This file
```

## 🔄 Pipeline Stages

### 1. Code Checkout
- Pulls latest code from GitHub
- Triggered by webhook

### 2. Code Linting
- Runs ESLint
- Checks code quality
- Identifies syntax errors

### 3. Code Build
- Creates Docker image
- Tags with build number
- Prepares for deployment

### 4. Unit Testing
- Runs npm test
- Validates core functionality

### 5. Containerized Deployment
- Stops old container
- Starts new container
- Health check verification
- Exposes on port 8080

### 6. Selenium Testing
- Builds test container
- Runs automated browser tests
- Validates UI functionality

## 🧪 Testing

### Automated Tests (Selenium)

**Test 1: Page Elements Verification**
- Verifies all UI elements load correctly
- Checks form inputs, buttons, table

**Test 2: Add Expense Functionality**
- Tests complete add expense workflow
- Verifies data appears in table
- Checks statistics update

### Run Tests Locally

```bash
# Using Docker Compose
docker-compose up -d
docker-compose --profile testing up selenium-tests

# Manual Docker
docker build -t expense-tracker .
docker run -d --name app -p 8080:8080 expense-tracker

docker build -f Dockerfile.selenium -t tests .
docker run --rm --network host tests
```

### Run Tests in Jenkins

Tests run automatically in the pipeline, or manually:
- Go to pipeline → Build Now

## 🚀 Deployment

### Application Access
- URL: `http://your-ec2-ip:8080`
- Automatically deployed after successful pipeline

### Docker Commands

```bash
# View running containers
docker ps

# View application logs
docker logs expense-tracker-app

# Stop application
docker stop expense-tracker-app

# Restart application
docker restart expense-tracker-app

# Remove container
docker rm -f expense-tracker-app
```

### Data Persistence

Data is stored in Docker volume:
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect expense-data

# Backup data
docker run --rm -v expense-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/expenses-backup.tar.gz /data
```

## 🐛 Troubleshooting

### Issue: Jenkins can't access Docker

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: Port 8080 already in use

```bash
# Find process
sudo lsof -i :8080

# Stop conflicting container
docker stop $(docker ps -q --filter "publish=8080")
```

### Issue: Webhook not triggering

1. Check GitHub webhook recent deliveries
2. Verify Jenkins URL is publicly accessible
3. Check EC2 security group allows port 8080
4. Re-save Jenkins job configuration

### Issue: Selenium tests fail

```bash
# Check application is running
docker ps | grep expense-tracker

# Check logs
docker logs expense-tracker-app

# Verify network
docker network ls
docker network inspect test-network
```

### Issue: Pipeline fails at build stage

```bash
# Clean up old images
docker system prune -a

# Rebuild from scratch
docker build --no-cache -t expense-tracker .
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Application port |
| DATA_DIR | /data | Data directory path |
| DOCKER_IMAGE | expense-tracker | Docker image name |
| CONTAINER_NAME | expense-tracker-app | Container name |

## 🔒 Security Notes

1. **EC2 Security**
   - Restrict SSH to your IP
   - Use strong passwords
   - Keep system updated

2. **Jenkins Security**
   - Change admin password
   - Enable CSRF protection
   - Limit plugin installations

3. **Docker Security**
   - Use official images
   - Scan for vulnerabilities
   - Don't run as root

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Selenium Documentation](https://selenium-python.readthedocs.io/)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Jenkins community for excellent documentation
- Selenium project for browser automation
- Docker for containerization platform
- AWS for cloud infrastructure

---

**Built with ❤️ for CI/CD Learning**
