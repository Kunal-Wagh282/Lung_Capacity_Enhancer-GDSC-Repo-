from django.shortcuts import render
from datetime import datetime,timedelta
# Create your views here.
from django.shortcuts import render, HttpResponse
from .models import *
from rest_framework import generics,status
from.serializers import*
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from .ReportGenrator.report_gen import generate_report
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from io import BytesIO
import matplotlib.pyplot as plt
from django.http import HttpResponse
from io import BytesIO
import pyrebase


from reportlab.graphics import renderPM


# Create your views here.

config = {
    "apiKey": "AIzaSyDPIzEH1-Jjdz8-70PBP46zfwTF-B3gYZI",
    "authDomain": "test-d8b5a.firebaseapp.com",
    "projectId": "test-d8b5a",
    "storageBucket": "test-d8b5a.appspot.com",
    "databaseURL": "https://test-d8b5a-default-rtdb.firebaseio.com",
    "messagingSenderId": "125070477750",
    "appId": "1:125070477750:web:0806f9fb68bb9354fa1917",
    "measurementId": "G-J9402R063V"
}

firebase = pyrebase.initialize_app(config)
authe=firebase.auth()
database=firebase.database()
current_date = datetime.today()
current_date = current_date.strftime("%Y-%d-%m")
current_date = str(current_date)


def get_p_id(u_id):
    while True:
        id = random.randint(1,10**6 )
        users = database.child("Data").child(u_id).get()  # Assuming "Data" is your top-level node
        for user in users.each():
            if (users == id):#checking if the unique id randomly created already exists in the database
                break
            else:
                return id



def get_id():
    while True:
        users = database.child("Data").get().val()
        if users is None or not users:  #this is to check if database is empty or not, if empty then
           id = random.randint(1,10**6 )
           return id
        else:
            id = random.randint(1,10**6 )
            users = database.child("Data").get()  # Assuming "Data" is your top-level node
            for user in users.each():
                if (users == id):#checking if the unique id randomly created already exists in the database
                    break
                else:
                    return id


class Register(APIView):
    serializer_class = UserRegisterSerializer
    def post(self,request,fromat =None):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():

            
            username = serializer.data.get('username')
            f_name = serializer.data.get('f_name')
            l_name = serializer.data.get("l_name")
            dob = serializer.data.get("dob")
            password = serializer.data.get('password')

            
            
            
            dob_date = datetime.strptime(dob, "%Y-%m-%d")
            today = datetime.today()
            age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))

            if age < 5:
                return Response({"error": "User's age must be at least 5 years old"}, status=status.HTTP_400_BAD_REQUEST)

            queryset = User.objects.filter (username = username)

            users = database.child("Data").get()  # Assuming "Data" is your top-level node
            if users.each():
                #checking if database is empty or not, if no then next line
                for item in users.each():
                    usernames = item.val().get("username")
                    if (usernames == username):
                        return Response({"error":"already exists"}, status=status.HTTP_226_IM_USED)
                    else :
                        user = User(username=username,f_name=f_name,l_name=l_name,dob=dob,password=password)
                        user.save()

                        # u_id = User.objects.filter(f_name=f_name,l_name=l_name).first().u_id
                        u_id=get_id() 
                        data = {"username":username,"f_name": f_name,"l_name":l_name,"dob":dob,"password":password}
                        database.child("Data").child(u_id).set(data)

                        profile = Profile(u_id = user.u_id,p_name = f_name, p_dob = dob)
                        profile.save()

                        # p_id = Profile.objects.filter(u_id=u_id).first().p_id
                        p_id = get_p_id(u_id)
                        data = {"p_name":f_name,"p_dob":dob}
                        database.child("Data").child(u_id).child(p_id).set(data)
                        
                        return Response({"Successful":"Successfully Registered"},status=status.HTTP_201_CREATED)
            else :
                #if database is empty
                user = User(username=username,f_name=f_name,l_name=l_name,dob=dob,password=password)
                user.save()

                # u_id = User.objects.filter(f_name=f_name,l_name=l_name).first().u_id
                u_id=get_id() 
                data = {"username":username,"f_name": f_name,"l_name":l_name,"dob":dob,"password":password}
                database.child("Data").child(u_id).set(data)

                profile = Profile(u_id = user.u_id,p_name = f_name, p_dob = dob)
                profile.save()

                # p_id = Profile.objects.filter(u_id=u_id).first().p_id
                p_id = get_p_id(u_id)
                data = {"p_name":f_name,"p_dob":dob}
                database.child("Data").child(u_id).child(p_id).set(data)
                
                return Response({"Successful":"Successfully Registered"},status=status.HTTP_201_CREATED)

            # if queryset.exists():
            #     return Response(serializer.errors, status=status.HTTP_226_IM_USED)
            
            
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            

class Login(APIView):
    serializer_class = UserLoginSerializer

    def post(self,request,format =None):

        serializer = self.serializer_class(data = request.data)

        if serializer.is_valid():
            username = serializer.data.get('username')
            password = serializer.data.get('password')


            users = database.child("Data").get()  # Assuming "users" is your top-level node
            if users.each():
                for user in users.each():
                    u_id = user.key()
                    usernames = user.val().get("username")
                    passwords = user.val().get("password")
                    if (username == usernames and password == passwords):
                        profile_data = []
                        user_data = database.child("Data").child(u_id).get().val()  # Assuming "Data" is your top-level node
                        if user_data:
                            for key, value in user_data.items():
                                if "p_name" in value and "p_dob" in value:
                                    p_name = value["p_name"]
                                    p_dob = value["p_dob"]
                                    profile_data.append({"p_name": p_name, "p_dob": p_dob})

                                    
                        return Response({'u_id':u_id, "profile": profile_data},status=status.HTTP_200_OK)
                    else:
                        continue
                return Response({'error': 'Invalid username or password or user does not exist'},status=status.HTTP_404_NOT_FOUND)




            # queryset = User.objects.filter(username= username,password = password)
            # if queryset.exists():
            #     user = queryset.first()
            #     profile_queryset = Profile.objects.filter(u_id = user.u_id)
            #     if profile_queryset.exists():
            #         profiles = profile_queryset
            #         return Response({'u_id':user.u_id, "profile": ProfileSerializer(profiles,many = True).data},status=status.HTTP_200_OK)
            #     else:
            #         return Response({'error': 'No Profiles Exisits Currently '},status=status.HTTP_204_NO_CONTENT)            
            # else:
            #     return Response({'error': 'Invalid username or password'},status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        

class AddProfile(APIView):
    serializer_class = ProfileAddSerializer

    def post(self, request, format = None):
        serializer = self.serializer_class(data = request.data)

        if serializer.is_valid():
            u_id = serializer.data.get('u_id')
            p_name = serializer.data.get('p_name')
            p_dob = serializer.data.get('p_dob')
            dob_date = datetime.strptime(p_dob, "%Y-%m-%d")
            today = datetime.today()

            

            age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
            if age < 5:
                return Response({"error": "User's age must be at least 5 years old"}, status=status.HTTP_204_NO_CONTENT)
            # queryset = Profile.objects.filter(p_name=p_name,u_id=u_id)

            user_data = database.child("Data").child(u_id).get().val()  # Assuming "Data" is your top-level node
            if user_data:
                for key, value in user_data.items():
                    if "p_name" in value and "p_dob" in value :
                        p_names = value["p_name"]
                        if (p_names == p_name):
                            return Response({"error":"already exists"}, status=status.HTTP_226_IM_USED)
                    elif database.child("Data").child(u_id).child("f_name").get().val() == p_name:
                        return Response({"error":"already exists"}, status=status.HTTP_226_IM_USED)
            # if queryset.exists():
            #     return Response({'error' : 'Profile name alredy There ','u_id':u_id},status=status.HTTP_226_IM_USED)
                    else:
                        # profile = Profile(p_name=p_name,u_id = u_id, p_dob = p_dob)
                        # profile.save()
                        p_id = get_p_id(u_id)
                        data = {"p_name":p_name,"p_dob":p_dob}
                        database.child("Data").child(u_id).child(p_id).update(data)
                        
                        profile_data = []
                        user_data = database.child("Data").child(u_id).get().val()  # Assuming "Data" is your top-level node
                        if user_data:
                            for key, value in user_data.items():
                                if "p_name" in value and "p_dob" in value:
                                    p_name = value["p_name"]
                                    p_dob = value["p_dob"]
                                    profile_data.append({"p_name": p_name, "p_dob": p_dob})  

                        return Response({'u_id':u_id, "profile": profile_data},status=status.HTTP_200_OK)       
        else:
            return Response(serializer.errors,status=status.HTTP_406_NOT_ACCEPTABLE)

class DelProfile(APIView):
    serializer_class = ProfileDelSerializer

    def post(self, request, format = None):
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            u_id = serializer.data.get('u_id')
            p_name = serializer.data.get('p_name')
            if database.child("Data").child(u_id).child("f_name").get().val() == p_name:
                return Response({'error': 'Main Profile, cannot be deleted'},status=status.HTTP_226_IM_USED)
            else:
                user_data = database.child("Data").child(u_id).get().val()  # Assuming "Data" is your top-level node
                if user_data:
                    for key, value in user_data.items():
                        if "p_name" in value and "p_dob" in value:
                            p_names = value["p_name"]
                            if (p_names == p_name):
                                database.child("Data").child(u_id).child(key).remove()
                                profile_data = []
                                user_data = database.child("Data").child(u_id).get().val()  # Assuming "Data" is your top-level node
                                if user_data:
                                    for key, value in user_data.items():
                                        if "p_name" in value and "p_dob" in value:
                                            p_name = value["p_name"]
                                            p_dob = value["p_dob"]
                                            profile_data.append({"p_name": p_name, "p_dob": p_dob})  
                                return Response({'u_id':u_id, "profile": profile_data},status=status.HTTP_200_OK)
                    return Response({'error': 'Profile not found'},status=status.HTTP_404_NOT_FOUND)
            # if p_name == User.objects.filter(u_id=u_id).first().f_name:
            #     return Response({'error': 'Main Profile, cannot be deleted'},status=status.HTTP_226_IM_USED)
            # del_queryset = Profile.objects.filter(u_id=u_id,p_name=p_name)
            # if del_queryset.exists():
            #     del_queryset.delete()
            #     return Response({'u_id':u_id,"profile":ProfileSerializer(Profile.objects.filter(u_id=u_id),many = True).data},status=status.HTTP_202_ACCEPTED)

            # else:
            #     return Response({'error': 'Profile not found'},status=status.HTTP_404_NOT_FOUND)
                 
        else:
            return Response(serializer.errors,status=status.HTTP_406_NOT_ACCEPTABLE)
    
class GraphDataSave(APIView):
    serializer_class = GraphDataReceiveSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():

            
            u_id = serializer.validated_data['u_id']
            p_name = serializer.validated_data['p_name']

            user_data = database.child("Data").child(u_id).get().val()  # Assuming "Data" is your top-level node
            if user_data:
                for key, value in user_data.items():
                    if "p_name" in value and "p_dob" in value:
                        p_names = value["p_name"]
                        if p_names == p_name:
                            p_id = key#getting the specific p_id

             
            # Retrieve the maximum ID under the current date
            max_id = 0
            data_under_date = database.child("Data").child(u_id).child(p_id).child(current_date).get().val()
            if data_under_date:
                max_id = max(map(int, data_under_date.keys()))
            else:
                max_id = 0

            # Increment the ID by one to get the new ID
            new_id = max_id + 1

            
            time_array = serializer.validated_data['time_array']
            volume_array = serializer.validated_data['volume_array']

            # Convert time_array and volume_array to JSON serializable types
            time_array_serializable = list(map(float, time_array))
            volume_array_serializable = list(map(float, volume_array))

            if len(time_array_serializable) < 2 :
                return Response({},status=status.HTTP_100_CONTINUE)

            area_under_curve = np.trapz(time_array_serializable, volume_array_serializable)
            total_volume =  np.round(np.abs(area_under_curve),3)

            
            
            max_time_blown = max(time_array)

            data = {
            "max_time_blown":max_time_blown,
            "area": area_under_curve,
            "total_volume": total_volume,
            "time_array": time_array,  # Save list1 under a separate node
            "volume_array": volume_array   # Save list2 under a separate node
            }
            database.child("Data").child(u_id).child(p_id).child(current_date).child(str(new_id)).update(data)
        

            

            return Response({"area": np.round(np.abs(area_under_curve),3)}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GarphDataSend(APIView):
    serializer_class = GraphDataRequestSerializer
    def post(self, request,format = None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            u_id = serializer.data.get('u_id')
            p_name = serializer.data.get('p_name')
            date = serializer.data.get('date')
            # queryset = GraphDatabase.objects.filter(u_id=u_id, p_name=p_name, date=date)
            # if queryset.exists():
            #     data = queryset
            #     return Response(GraphDataSendSerializer(data, many = True).data,status=status.HTTP_200_OK)
            # return Response({'message':f'no data on date {date}'}, status=status.HTTP_204_NO_CONTENT)
            date = str(date)
            date  =datetime.strptime(date,"%Y-%m-%d")
            date = date.strftime("%Y-%d-%m")
            date = str(date)
            graph_data = []

        # Assuming "Data" is your top-level node in Firebase
            user_data = database.child("Data").child(u_id).get().val()

            if user_data:
                for p_id, profile_data in user_data.items():
                    if "p_name" in profile_data and profile_data["p_name"] == p_name:
                        for date_in_data, data_under_date in profile_data.items():
                            if date_in_data == date:
                                for entry_data in data_under_date:
                                    # Constructing the graph data entry
                                    if entry_data is not None:
                                        entry = {
                                            "u_id": u_id,
                                            "p_name": p_name,
                                            "time_array": entry_data.get("time_array", []),
                                            "volume_array": entry_data.get("volume_array", []),
                                            "date": current_date,
                                            "total_volume": entry_data.get("total_volume", 0.0)
                                        }
                                        graph_data.append(entry)

            return Response(graph_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



    
class GenerateReport(APIView):
    serializer_class = ReportGeneratorRequestSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            u_id = serializer.data.get('u_id')
            p_name = serializer.data.get('p_name')
            start_date = serializer.data.get('from_date')
            end_date = serializer.data.get('to_date')
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d")

            # Dictionary to store the aggregated data
            report_data = {
                "u_id": u_id,
                "p_name": p_name,
                "average_time_array": [],
                "date_array": []
            }

            # Iterate over the date range
            current_date = start_date
            while current_date <= end_date:
                # Calculate the average time array and corresponding date array for the current date
                current_date_str = current_date.strftime("%Y-%d-%m")
                average_time, _ = self.calculate_average_time(u_id, p_name, current_date_str)

                # Append the average time and date to the respective arrays in the report_data dictionary
                report_data["average_time_array"].append(average_time)
                report_data["date_array"].append(current_date_str)

                # Move to the next date
                current_date += timedelta(days=1)

            return Response([report_data], status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def calculate_average_time(self, u_id, p_name, date):
        # Query the database to get the max_time_blown values for the specified date
        max_time_blown_values = []

        # Assuming "Data" is your top-level node in Firebase
        user_data = database.child("Data").child(u_id).get().val()

        if user_data:
            for p_id, profile_data in user_data.items():
                if "p_name" in profile_data and profile_data["p_name"] == p_name:
                    for date_in_data, data_under_date in profile_data.items():
                        # Check if the date matches the specified date
                        if date_in_data == date:
                            for entry_data in data_under_date:
                                # Check if the entry contains max_time_blown
                                if entry_data is not None and "max_time_blown" in entry_data:
                                    max_time_blown_values.append(entry_data["max_time_blown"])

        # If no data found for the current date, return 0 for average time
        if not max_time_blown_values:
            return 0, date  # Return 0 for average time and the current date

        # Calculate the average time
        average_time = sum(max_time_blown_values) / len(max_time_blown_values)

        return average_time, date
            # res_date = from_date
            # print("The range dates are:")
            # while res_date <= to_date:
                
            #     res_date += datetime.timedelta(days=1)

            # queryset = GraphDatabase.objects.filter(date__range=(from_date, to_date), u_id=u_id, p_name=p_name)
            # if queryset.exists():
            #     response  = generate_report(queryset.values())
                
        #     return Response({'message':f'No data found between {from_date} and {to_date} '}, status=status.HTTP_204_NO_CONTENT)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
def display(request):
    st=User.objects.all() 
    return render(request,'display.html',{'st':st})