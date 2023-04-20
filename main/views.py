from django.shortcuts import render, redirect
from django.views import View
from .forms import ShapefileForm
from .models import Files
from django.views.generic.base import TemplateView
from django.conf import settings
import os
from django.http import JsonResponse
from django.urls import reverse
from .shapefile_class import Shapefile as shp_op
from .helper_func import remove_files_in_folder, save_user_files, find_files, print_with_lines
import uuid
import time
import zipfile

class IndexView(TemplateView):
    template_name = 'main/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

    def render(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


    def get(self, request, **kwargs):
        user_id = request.COOKIES.get('user_id')

        print_with_lines(f"user_id: {user_id}")

        all_data = Files.objects.filter(user_id=user_id)
        geojson_list = []
        data_list = []
        for obj in all_data:
            data_dict = {
                'name': obj.name,
                'geojson': obj.geojson
            }
            data_list.append(data_dict)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse(data_list, safe=False)
        else:
            context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


class SaveShapefilesView(View):
    template_name = 'main/upload_shapefile.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):

        print_with_lines(f"Post request received")
        form = ShapefileForm(request.POST, request.FILES)
        folder_path = os.path.join(settings.MEDIA_ROOT, 'shapefiles')

        print_with_lines(f"Form Initialized")

        time_start_check = time.time()
        if form.is_valid():
            user_id = request.COOKIES.get('user_id')
            if not user_id:
                success_msg = "deadserv: New User, post request was successful! Click on 'Load Layer' to add your data on the map. You can close this dailog box now."
                user_id = uuid.uuid4().hex
                
            else:
                success_msg = "deadserv: Returning user, post request was successful! Click on 'Load Layer' to add your data on the map. You can close this dailog box now."

            data = {'success_msg': success_msg}
            response = JsonResponse(data)
            response.set_cookie('user_id', user_id, max_age=3 * 24 * 60 * 60)
            time_end_check = time.time()

            print_with_lines(f"Form valid, user id checked, cookie set: {time_end_check - time_start_check}")
            
            user_folder_path = os.path.join(folder_path, user_id)
            if not os.path.exists(user_folder_path):
                os.mkdir(user_folder_path)
            
            remove_files_in_folder(user_folder_path)
            print_with_lines("Removed files in the user folder")

            zip_file = request.FILES['zipfile']
            print_with_lines(f"zip in request {zip_file}")

            zip_path = os.path.join(user_folder_path, zip_file.name)

            with open(zip_path, 'wb+') as destination:
                for chunk in zip_file.chunks():
                    destination.write(chunk)
            print_with_lines(f"Saved zip at: {zip_path}")

            time_start_save_to_storage = time.time()
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(user_folder_path)        
            time_end_save_to_storage = time.time()

            print_with_lines(f"Time taken to save the Compressed file in server storage: {time_end_save_to_storage - time_start_save_to_storage}")

            time_start_shp_process = time.time()
            shapefile_path = find_files(user_folder_path, "*", "shp")

            shp_operations = shp_op(shapefile_path)

            in_ds, in_layer, in_spatial_ref, in_geom = shp_operations.find_spatial_info(shapefile_path)

            time_start_transformation = time.time()
            shp_operations.srs_transformation(in_spatial_ref, 4326, in_geom, in_layer, user_folder_path)
            time_end_transformation = time.time()

            print_with_lines(f"Time taken to transformation: {time_end_transformation - time_start_transformation}")


            reprojected_shp_path = find_files(user_folder_path, "reprojected", "shp")

            print_with_lines("Converting shapefile to geojson")
            time_start_conversion = time.time()
            if reprojected_shp_path != None:
                geojson_str = shp_operations.shapefile_to_json(reprojected_shp_path)
            else:
                geojson_str = shp_operations.shapefile_to_json(shapefile_path)

            db_filename, extension = os.path.splitext(os.path.basename(shapefile_path)) # type: ignore
            time_end_shp_process = time.time()
            

            print_with_lines(f"Time taken to convert shp into geojson: {time_end_shp_process - time_start_conversion}")


            print_with_lines(f"Time taken to process the whole file: {time_end_shp_process - time_start_shp_process}")


            print_with_lines("Saving to database")
            time_start_save_to_database = time.time()
            geojson_data = Files(
                user_id = user_id,
                name = db_filename,
                geojson = geojson_str,
                )
            geojson_data.save()
            time_end_save_to_database = time.time()
            print_with_lines(f"Time taken to save to database: {time_end_save_to_database - time_start_save_to_database}")      

            response.set_cookie('user_id', user_id, max_age= 3 * 24 * 60 * 60)

            return response
        else:
    
            return render(request, self.template_name, {'form': form})
        
