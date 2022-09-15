# Grotto

Generate lighting scenery using a Raspberry Pi, LED strips, and photos.

This is a collection of software intended to be used to drive LED strips
from a Raspberry Pi.

## Control Panel

This is a web server, intended to be used for generating lighting scenes
from still images.

## Manuallt Generating Wave Scenery

The logic in the Control Panel was based on the following shell
commands.

start by converting from PNG to a PPM

```
pngtopam IMG_1234.png > base_image.ppm
```


Crop the skyline out of the image

```
pamcut -top 2050 base_image.ppm > image-cut.ppm
```

Scale the x while keeping the y for traveling:

```
pamscale image-cut.ppm -width 128 -yscale 1 > image-scale.ppm
```
