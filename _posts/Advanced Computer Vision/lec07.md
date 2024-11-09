#### Region Proposal Network

The network does the following -

- Slide a small window on the feature map

- A small network to do classification - object or no-object

- A regressor to give the bounding box

#### Anchors

Anchors are a set of reference positions on the feature map 

3 dimensions with aspect ratio, 3 different scales of boxes, 

#### Training

#### Non-Maximal Supression

Since, multiple anchor boxes can map to an object, we iteratively choose the highest scoring box among the predictions and supp ress the predictions that have high IoU with the currently chosen box.

## Transformer based Architectures

### DETR

Faster R-CNN has many steps, handcrafted architecture and potentially non-differentiable steps. In contrast, DETR was proposed - an end-to-end transformer based architecture for object detection. The motivation was to capture all the human-designed optimization parts of the pipeline into one black-box using a transformer.

![](/assets/img/Computer%20Vision/2024-04-24-17-53-05-image.png)

Why do we want such an end-to-end architecture? They are more flexible to diverse data, capturing large datasets, finetuning, etc. 

In this architecture, a CNN backbone like ResNet extracts the features which are passed through the encoder to obtain latent representations. These are then used with a decoder along with object queries in the form of cross-attention to give bounding boxes as the output.

After obtaining the bounding boxes, the loss is appropriately calculated by matching the boxes to the correct labels. It is our task to assign a ground truth label to the predictions

> Hungarian??

The decoder takes object queries as input, 

500 epochs

encoder is segmented, decoder is just getting bounding boxes

### DINO

lagging in scale variant objects. 

contrastive loss acting for negative samples

YOLOX
