import bpy
import math
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name, color):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    return m

green = mat('Leaf_Green', (0.12, 0.48, 0.18))
light_green = mat('Leaf_Light', (0.35, 0.72, 0.22))
brown = mat('Wood', (0.38, 0.18, 0.08))
red = mat('Cabin_Red', (0.58, 0.10, 0.07))
cream = mat('Trim_Cream', (0.95, 0.75, 0.42))
water = mat('Water', (0.08, 0.45, 0.72))

def cube(name, loc, scale, material, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if bevel:
        mod = o.modifiers.new('Soft edges', 'BEVEL'); mod.width = bevel; mod.segments = 2
    return o

def cone(name, loc, radius, depth, material, vertices=8):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius*0.72, depth=depth, location=loc)
    o=bpy.context.object; o.name=name; o.data.materials.append(material); return o

def tree(x, z, s=1.0):
    cube('Tree_Trunk', (x, 1.2*s, z), (0.22*s, 1.2*s, 0.22*s), brown, 0.08*s)
    cone('Tree_Crown', (x, 3.0*s, z), 1.15*s, 2.7*s, green)
    cone('Tree_Crown_Light', (x+0.2*s, 3.8*s, z-0.1*s), 0.75*s, 1.8*s, light_green)

for x,z,s in [(-8,-2,1.2),(-10,5,0.9),(8,-1,1.1),(10,6,1.4),(-6,7,0.8),(6,6,0.9)]: tree(x,z,s)

cube('Bridge', (0, 0.25, 1.2), (4.6, 0.18, 1.3), brown, 0.12)
for x in range(-4,5): cube('Bridge_Plank', (x*0.95, 0.48, 1.2), (0.36, 0.10, 1.42), cream, 0.04)

cube('River', (0, -0.12, 5.2), (14, 0.08, 2.2), water)

cube('Cabin', (-7, 1.15, -5), (2.1, 1.15, 1.6), red, 0.15)
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=2.8, radius2=0, depth=1.4, location=(-7, 3.0, -5), rotation=(0, math.radians(45), 0))
roof=bpy.context.object; roof.name='Cabin_Roof'; roof.data.materials.append(cream)

for x in (-2, 2): cube('Dock_Post', (x, 1.0, -2.3), (0.12, 1.0, 0.12), brown)
cube('Dock_Roof', (0, 2.3, -2.3), (2.5, 0.12, 0.12), brown)

bpy.ops.wm.save_as_mainfile(filepath='C:/Users/User/Documents/game2/assets/heart_town_props.blend')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath='C:/Users/User/Documents/game2/assets/village_props.glb', export_format='GLB', use_selection=True)
