# ☁️ How to Create MySQL Database on AWS RDS

Follow this step-by-step guide to set up the MySQL database for your Gym Management System in AWS.

## 🟢 Step 1: Login & Select Region
1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2. In the top-right corner, select the region **Europe (Stockholm) eu-north-1** (as per your initial requirement).
3. Search for **"RDS"** in the top search bar and click on it.

## 🟢 Step 2: Create Database
1. Click the orange **"Create database"** button.
2. **Choose a database creation method**: Select **Standard create**.
3. **Engine options**: Select **MySQL**.
4. **Engine Version**: Select **MySQL 8.0.x** (latest version is fine).
5. **Templates**: Select **Free tier** (Important to avoid costs).

## 🟢 Step 3: Settings
1. **DB instance identifier**: `gym-db`
2. **Master username**: `admin`
3. **Master password**: Choose a strong password (e.g., `GymPass123!`) and confirm it.

## 🟢 Step 4: Instance Configuration
1. **DB instance class**: Select **db.t3.micro** (Eligible for free tier).
2. **Storage**: Leave defaults (20 GiB General Purpose SSD).

## 🟢 Step 5: Connectivity (Crucial Step!)
1. **Compute resource**: "Don't connect to an EC2 compute resource".
2. **Virtual private cloud (VPC)**: Default VPC.
3. **Public access**: Select **Yes** (Required to connect from your local computer).
4. **VPC security group**: Select **Create new**.
   - Name: `gym-db-sg`
   - **IMPORTANT**: After creating, you will need to edit this security group to allow inbound traffic on port `3306` from **"My IP"** (your laptop's IP).

## 🟢 Step 6: Create
1. Scroll down to the bottom.
2. Expand **Additional configuration**.
3. **Initial database name**: `gym_db` (Type this exactly).
4. Click **Create database**.
5. It will take 5-10 minutes to create. Wait until status is "Available".

## 🟢 Step 7: Get Connection Details
Once status is "Available":
1. Click on the DB identifier (`gym-db`).
2. Under **Connectivity & security** tab, copy the **Endpoint** (e.g., `gym-db.cxyz.eu-north-1.rds.amazonaws.com`).

## 🟢 Step 8: Update Project Configuration
Open your project in VS Code and update `backend/.env`:

```env
PORT=5000
DB_HOST=your-endpoint-from-step-7.rds.amazonaws.com
DB_USER=admin
DB_PASS=your-password-from-step-3
DB_NAME=gym_db
JWT_SECRET=your_secret_key
```

## 🟢 Step 9: Initialize Tables
You need to run the `database.sql` script to create the tables.

### Option A: Using VS Code (Recommended)
1. Install **"MySQL"** extension by Weijan Chen or **"SQLTools"** in VS Code.
2. Connect using the credentials above.
3. Open `backend/database.sql`.
4. Run the script.

### Option B: Using Terminal (If MySQL is installed locally)
```bash
mysql -h <your-endpoint> -u admin -p gym_db < backend/database.sql
```

✅ **Done!** Your backend will now connect to the cloud database.
