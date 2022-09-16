import base64
from io import BytesIO

from flask import \
  Flask, render_template, request, send_from_directory
from PIL import Image

PIXEL_WIDTH = 128

app = Flask(__name__)

def encode_image_for_formstate(source_image):
  return base64.b64encode(source_image).decode('utf-8')

@app.route("/")
def index():
    return render_template('index.tmpl.html')

@app.route("/css/<path:path>")
def stylesheets(path):
  return send_from_directory('static/css', path)

@app.route("/trim")
def trim():
    return render_template(
      'image_upload.tmpl.html'
    )


@app.route("/crop/resize", methods=['POST'])
def crop_resize():
  app.logger.info('resizing')

  if 'source-image' not in request.files:
    return "Missing source image"

  file = request.files['source-image']

  image = Image.open(file)

  # reset file buffer to re-encode
  file.seek(0)
  encoded_file_content = encode_image_for_formstate(file.read())

  return render_template(
    'cropper.tmpl.html',
    image_format=image.format,
    encoded_file_content=encoded_file_content
  )

def extract_form_image(fieldname):
  encoded_file = request.form['source-image']
  encoded_file_format = request.form['source-image-format']
  source_image = base64.b64decode(encoded_file)
  file_imgdata = BytesIO(source_image)

  scene_image = Image.open(file_imgdata, formats=['PNG', encoded_file_format])

  return scene_image

@app.route("/crop/image", methods=['POST'])
def crop_image():
  app.logger.info('cropping')

  image = extract_form_image('source-image')

  min_x = int(request.form['min-x'])
  min_y = int(request.form['min-y'])
  max_x = int(request.form['width']) + min_x
  max_y = int(request.form['height']) + min_y

  cropped = image.crop((min_x, min_y, max_x, max_y))

  app.logger.info(cropped.size)

  downsampled_height = max_y - min_y

  downsampled = cropped.resize(
    (PIXEL_WIDTH, downsampled_height),
    resample=Image.BICUBIC
  )

  output = BytesIO()
  downsampled.save(output, format='PNG')

  app.logger.info(output.seek(0))

  encoded_file_content = encode_image_for_formstate(output.read())

  return render_template(
    'resampler.tmpl.html',
    encoded_file_content=encoded_file_content
  )


@app.route("/scene", methods=['POST'])
def create_scene():
  scene_name = request.form['scene-name']

  scene_image = extract_form_image('source-image')

  output_file = 'data_dir/%s.ppm' % (scene_name)
  scene_image.save(output_file, format='PPM')

  return "ok"

###########################################
# Debugging endpoints
###########################################

@app.route("/debug/crop/image")
def debug_crop_image():
  test_file = open('samples/vancouver.png', 'rb')

  test_file_content = test_file.read()

  encoded_file_content = encode_image_for_formstate(test_file_content)

  filesize = len(encoded_file_content)

  return render_template(
    'cropper.tmpl.html',
    filesize=filesize,
    encoded_file_content=encoded_file_content
  )
