import glob
import os
import zipfile

def remove_files_in_folder(folder_path):
    files_list = glob.glob(os.path.join(folder_path, "*"))
    if len(files_list) > 0:
        for file in files_list:
            os.remove(file)

def save_user_files(user_files, folder):
    zip_file = user_files[0]
    zip_path = os.path.join(folder, zip_file.name)
    with open(zip_path, 'wb+') as destination:
            for chunk in zip_file.chunks():
                destination.write(chunk)
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(folder)

def find_files(folder_path, filename="*", extension="*"):
    files_list = glob.glob(os.path.join(folder_path, filename+"."+ extension))
    if not files_list:
        return None  
    return files_list[0]

def print_with_lines(print_statement):
    print("_______________________________________")
    print("_______________________________________")
    print(f"{print_statement}")
    print("_______________________________________")
    print("_______________________________________")