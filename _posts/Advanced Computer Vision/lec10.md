# Universal Segmentation

Specialized architectures for semantic

## MaskFormer

The architecture contains a strong CNN backbone for the encoder along with a query and pixel decoder. The query decoder essentially takes $n$ inputs to generate $n$ masks. The outputs from these layers are passed through an MLP to get binary masks for different classes.

## Masked2Former

Uses a masked attention layer instead of cross-attention to provide faster convergence 

### Limitations

Needs to be trained on speicfic datasets, struggles with small objects and large inference time. 

Hasn't been extended to video segmentation and panoptic segmentation.

## Mask DINO

Does both detection and segmentation. A Mask prediction branch along with box prediction in DINO.

### Unified Denoising Training

# Foundation Models

Models that have been trained on simple tasks which have good performance in the pipelines of other tasks for **zero-shot transfer** capabilities. Such models were first used in Natural Language Processing and using these in vision is typicalled hindered by  unavailability of labeled data.

## Segment Anything

A model developed by Meta with zero-shot segmentation capabilities. The task this model tries to solve is to allow for interactive and automatic use with zero-shot generatlization and re-use. The model allows for flexibile prompts with real-time usage and is ambiguity-aware. The model also has a data-engine which is used to generate data through the model.

### Promptable segmentation

The model generates a valid mask for a given prompt (even if ambiguous) as input. How is the ambiguity resolved? Ambiguous cases arise when the mutiple objects lie on top of each other. 

![](/assets/img/Computer%20Vision/2024-05-03-17-21-39-image.png)

The image encoder is heavy - a pretrained ViT with masked autoencoder. The design choice for the masking involved masking around 75% of the patches. Unlike NLP tasks, vision tasks rely heavily on spatial information and neighbor patches can be reconstructed without much effort. Also, NLP tasks can get away with a simple MLP for decoders but vision taks require strong decoders.

The model allows for prompts using points, box or text. The decoder has self-attention on the primpts followed by cross-attention with image and MLP for non-linearity to get masks. The model also estimates the IoU to rank masks.

The emphasis of the model was also to make it universal. Since the encoder is heavy, the embeddings are precomputed after which the prompt encoder and mask decoder work quite fast. 

### Data Engine

There is no large-scale dataset available for training a segmentation model of this scale. Initially, the model has been trained iteratively on available datasets with several rounds of human correction. Following this, in the semi-automatic stage, the diversity of outputs (increasing ambiguity in overlapping objects) is improved by human refinement. Finally, in the fully automatic stage, prompting is introduced and masks with high IoU are preserved followed by NMS. 

### Zero-shot transfer capabilities

The idea is to fine-tune the model for specific tasks like edge-derection, object proposals and isntance segmentation.

# Future Trajectory Prediction

This problem arises in many applications, particularly in autonomous driving. Given traffic participants and scene elements which are inter-dependent, we need to predict trajectories with scene awareness and multimodality.  Humans are able to predict up to 10 seconds in highway scenes and plan their trajectory effectively whereas the SOTA models have a large gap in performance.

More concretely, the algorithm takes a video sequence as an input, and needs to predict **probabilistic** trajectories which are diverse, have 3D awareness, capture semantics interactions and focus on **long-term rewards**. There are many components in these solutions including 3D localization module, generative sampling modules, semantic scene modules and scene aware fusion modules with encoders and decoders.

# 
