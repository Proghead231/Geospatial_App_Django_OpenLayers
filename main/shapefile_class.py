
from osgeo import osr
import os
from osgeo import ogr
import shapefile
import json
import fiona
from multiprocessing import Pool, cpu_count
from django.contrib.gis.geos import GEOSGeometry

class Shapefile:
    def __init__(self, shapefile_path):
        self.shapefile_folder = shapefile_path

    def find_spatial_info(self, spatial_data_path):
        in_ds = ogr.Open(spatial_data_path)
        in_layer = in_ds.GetLayer()
        in_spatial_ref = in_layer.GetSpatialRef()
        in_geom = in_layer.GetGeomType()
        return in_ds, in_layer, in_spatial_ref, in_geom

    def srs_transformation(self, in_spatial_ref, out_epsg_code, in_geom, in_layer, folder_path):
        out_shp = os.path.join(folder_path, "reprojected.shp")
        out_prj = os.path.join(folder_path, "reprojected.prj")
        print("______________________________________________________________________")
        print("______________________________________________________________________")
        print("in-epsg, out-epsg:", in_spatial_ref.GetAuthorityCode(None), out_epsg_code)
        print("in-epsg, out-epsg type:", type(int(in_spatial_ref.GetAuthorityCode(None))), type(out_epsg_code))
        print("does epsg match: ", int(in_spatial_ref.GetAuthorityCode(None)) == out_epsg_code)
        print("______________________________________________________________________")
        print("______________________________________________________________________")
        if int(in_spatial_ref.GetAuthorityCode(None)) != out_epsg_code:

            out_spatial_ref = osr.SpatialReference()
            out_spatial_ref.ImportFromEPSG(out_epsg_code)
            out_spatial_ref.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
            coord_transform = osr.CoordinateTransformation(in_spatial_ref, out_spatial_ref)
            print("______________________________________________________________________")
            print("______________________________________________________________________")
            print("does epsg code match: ", int(in_spatial_ref.GetAuthorityCode(None)) == out_epsg_code)
            print("does whole srs match: ", in_spatial_ref == out_spatial_ref)
            print(f"Transforming from {in_spatial_ref}")
            print("______________________________________________________________________")
            print(f"To {out_spatial_ref}")
            print("______________________________________________________________________")
            driver = ogr.GetDriverByName('ESRI Shapefile')
            out_ds = driver.CreateDataSource(out_shp)
            out_layer = out_ds.CreateLayer("reprojected", geom_type = in_geom)

            in_layer_defn = in_layer.GetLayerDefn()
            for i in range(in_layer_defn.GetFieldCount()):
                field_defn = in_layer_defn.GetFieldDefn(i)
                out_layer.CreateField(field_defn)

            out_layer_defn = out_layer.GetLayerDefn()

            in_feature = in_layer.GetNextFeature()
            while in_feature:
                geom = in_feature.GetGeometryRef()
                geom.Transform(coord_transform)
                out_feature = ogr.Feature(out_layer_defn)
                out_feature.SetGeometry(geom)
                

                for i in range(0, out_layer_defn.GetFieldCount()):
                    field_defn = out_layer_defn.GetFieldDefn(i)
                    out_feature.SetField(
                        field_defn.GetNameRef(),
                        in_feature.GetField(i)
                    )
                out_layer.CreateFeature(out_feature)
                out_feature = None
                in_feature = in_layer.GetNextFeature()
            
            out_spatial_ref.MorphToESRI()
            prj_file = open(out_prj, 'w')
            prj_file.write(out_spatial_ref.ExportToWkt())
            prj_file.close()

        in_ds = None
        out_ds = None


    def process_features(self, feature):
        geometry_dict = feature['geometry'].__geo_interface__
        feature_dict = {
            "type": "Feature",
            "geometry": geometry_dict,
            "properties": dict(feature['properties'])
        }
        return feature_dict
    
    def shapefile_to_json(self, shapefile_path):
        with fiona.open(shapefile_path, use_rs=True) as src:
            pool = Pool(cpu_count())
            features = pool.map(self.process_features, src)

            geojson_dict = {
                "type": "FeatureCollection",
                "features": features
            }
            geojson_str = json.dumps(geojson_dict)
        return geojson_str
