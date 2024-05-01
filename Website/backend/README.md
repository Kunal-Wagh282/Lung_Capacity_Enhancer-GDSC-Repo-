
# Backend API Project

This is a Django-based backend API project that provides various functionalities such as user registration, login, profile management, graph data storage and retrieval, and report generation.

## Features

- **User Registration**: Users can register with their username, first name, last name, date of birth, and password. The minimum age requirement for registration is 5 years old.
- **User Login**: Registered users can log in with their username and password, and retrieve their profile information.
- **Profile Management**: Users can add, delete, and view their profiles. Each profile has a name and date of birth.
- **Graph Data Storage**: Users can save graph data, including time and volume arrays, for their profiles. The total volume (area under the curve) is calculated and stored.
- **Graph Data Retrieval**: Users can retrieve their graph data for a specific date and profile.
- **Report Generation**: Users can generate reports containing their graph data within a specified date range for a particular profile.

## Installation

1. Clone the repository:
   
   git clone https://github.com/Kunal-Wagh282/LCEWEBBACKEND.git
   

2. Navigate to the project directory:
   
   cd backend-api
   

3. Create a virtual environment (optional but recommended):
   
   python -m venv env
   source env/bin/activate  # On Windows, use `env\Scripts\activate`
   

4. Install the required dependencies:
   
   pip install -r requirements.txt
   

5. Set up the Django project:
   
   python manage.py migrate
   

## Usage

1. Start the Django development server:
   
   python manage.py runserver
   

2. The API endpoints can be accessed at `http://localhost:8000/api/`. You can use tools like Postman or cURL to interact with the API.

3. Refer to the `api/urls.py` file for the available endpoints and their corresponding views in `api/views.py`.

## API Endpoints

- `POST /api/register/`: Register a new user.
- `POST /api/login/`: Log in an existing user.
- `POST /api/add-profile/`: Add a new profile for a user.
- `POST /api/del-profile/`: Delete a profile for a user.
- `POST /api/graph-data/`: Save graph data for a user's profile.
- `POST /api/get-graph-data/`: Retrieve graph data for a user's profile on a specific date.
- `POST /api/generate-report/`: Generate a report containing graph data for a user's profile within a specified date range.

