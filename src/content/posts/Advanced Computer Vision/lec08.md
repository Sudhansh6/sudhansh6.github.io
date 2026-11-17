## Single Shot-Detectors

The motivation for these networks is to infer detections faster without much tradeoff in accuracy. 

**Anchor boxes**

no ambiguous IoU

Hard negative mining

### You Only Look Once (YOLO)

Divide into grids

anchor boxes in grid and class probability map

### YOLO-X

No anchored mechanism - hyperparameter tuning, more predictions, less generalization (OOD fails)

Detection head decoupling, no anchor boxes, SimOTA

predict size and centers rather than top-left

mosaicing and mixing 

### Pyramid Feature Extractions

RFCN

# Semantic Segmentation

The goal in this task is much more fine-tuned wherein we assign class pixel-wise. We want locally accurate boundaries as compared to finding bounding boxes in object detection. The approaches require global reasoning as well.

A  naive approch would be to classify a pixel by considering the patch around the pixel in the image. This is very expensive computationally and does not capture any global information.

Another approach is to consider image resolution convolutions (purely convolutions with stride 1, no pooling) and maining the image resolution to produce the output. This still does not work quite well, and they also consume more memory.

Taking classification networks as the motications, some networks try pooling/striding to downsample the features. This architecture corresponds to the encoder part of the model, and the decoder then upsamples the image using transposed convolution, interpolation, unpooling to recover the spatial details in the original size. The convolutions can go deeper without occupying a lot of memory. 

How do we upsample?

- Transposed convolution to upsample. The operation is shown below -
  
  ![Transpose Convolution for Up-Sampling Images | Paperspace Blog](https://blog.paperspace.com/content/images/2020/07/conv.gif)
  
  However, the outputs are not very precise. Combine global and local information.

- U-Net

- Unpooling followed by convolutions (simpler implementation of transposed convolution) 
  
  The **max-unpooling** operation does the following -
  
  Why is this better? Lesser memory

In all the architectures above, once you downsample the image, you lose a lot of spatial information and the network uses a significant amount of parameters learning the upsampling process to represent the final output. To help with this, we can do the following

- Predict at multiple scales and combine the predictions

- **Dilated convolutions** - These are used to increase the receptive field without downsampling the image too much -
  
  ![Animations of Convolution and Deconvolution — Machine Learning Lecture](https://th.bing.com/th/id/R.4992be8ec58775d0f6f963c2ae7129b3?rik=orAxXCOkxWt5dw&pid=ImgRaw&r=0)
  
  It's multi-scale and also captures full-scale resolution. The idea of dilated convolution is very important in other tasks as well - It prevents the loss of spatial information in downsampling tasks. However, there are gridding artifacts and higher memory consumptions with Dilated networks.
  
  **Degridding solutions**
  
  - Add convolution layers at end of the network with progressively  lower dilation
  
  - Remove skip connections in new layers, can propogate gridding artefacts because skip connections transfer high-frequency information.

- Skip-connections

- 
