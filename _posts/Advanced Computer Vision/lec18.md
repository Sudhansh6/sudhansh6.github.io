## Prolific Dreamer

As mentioned before, Google first released Dream Fusion for this problem. It used Imagen and Classifier-free guidance, but it did have the limitations mentioned before.

To improve on this performance, the authors of Prolific Dreamer modified the SDS Loss to something known as **Variation Distillation Score** - our goal is match the generated distribution with the distribution formed by multi-view images of a scene.

This is a difficult task as it is a sparse manifold in a complex high-dimensional space.

Do we have a metric to quantitatively analyse these models? **T3 Bench** is a benchmark score that checks the text-3D model alignment and the quality of the result itself.

## ReconFusion

ZeroNVS is a modification over Zero-1-2-3 that does not require any pretraining on 3D models to generate models. However, this paper along with other approaches during this time required heavy pretrained models, with high computational requirements and scene specific fine-tuning. Along with these, they also had floater artifacts and inconsistencies in multi-view generation. 

PixelNerf is one of the state-of-the-art 3D reconstruction papers that does not require dense training data because it relies on underlying pixel structure. The idea is to use this scene representation with latent diffusion models to address the limitations of the previous papers.

How do we train NeRF and Diffusion models simultaneously? 

- We first have a reconstruction loss for the NeRF part wherein we sample a novel view and use some image similarity loss like L2 to optimize the network.

- Then, we have a sampling loss for the diffusion model that has LPIPS and a component for multi-view consistency

Interestingly, the authors choose DDIM for the diffusion model over stochastic sampling (probably helps with multi-view consistency). 

Also, they use a trajectory based novel view sampling to further maintain consistency across views.

The resultant method is able to reconstruct a consistent 3D model even with inconsistent 2D views!

# Vision and Language

The idea is to use an LLM agent to use language as a means to solve complex visual workflows. Along with human-curated high-level concepts, these can solve planet-scale problems. Robots can work on more general tasks - physically grounding them on images.

The main problem in realizing these models is aligning text and image concepts. 

## Pre-training Tasks: Generative

GPT uses **causal modeling** whereas BERT uses **masked modeling**. In the latter method, the words from the input data is masked out, and the model must predict the missing words. This allows global supervision allowing the model to look at both past and future data.

In context of images, we mask out some patches in the image and the model has to predict the remaining patches. This sort of an approach is displayed in **Segment Anything Model (SAM)**.

However, some types of tasks may not support such a paradigm - text generation in a conversation. This is where causal modeling is used - the model is only allowed to look at the past data.

How do we do supervision in this case? It is similar to what we do in auto-regressive models for generating images and for generating text for images, it is similar to MLE.
