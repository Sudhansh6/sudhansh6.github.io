## Instant-NGP

### Graphics Primitives

A form of representation for objects in the real-world. For example, an image is a graphics primitive that maps 2D pixels to RGB values.

So what is the motivation to have neural fields represent 3D volumes over voxels or point clouds? The latter are explicit representations which take up a lot of space! 

### NeRFs

We have seen that high-frequency encoding is used to effectively represent high-frequency features. This is a form of non-parametric encoding.

Parametric encodings on the other hand are more complicated, and can be used to learn feature vectors.

### Multi-resolution hash-encoding

The scene is divided into multiple grids - the corners of each cube are hashed and stored in a hash table. For any point outside this lattice, we simply use a linear combination based on distances - this ensures continuity and differentiability.

What exactly is hashed? The high-dimensional vector embedding for each 3D point is stored. Furthermore, the authors implement a low-level CUDA kernel to realise fast matrix multiplications.

This implementation greatly reduces the training time and reduces the memory used. It takes days to train NeRFs, and with this the model could be trained in a couple of seconds.

### Method Agnostic!

This idea is not only for NeRFs but can be used for other primitives like Gigapixel images, Neural SDFs, etc.

### Weaknesses

- Rely on neural networks to resolve hash collisions - cause microstructure artifacts

- Hand-crafter hash function

- May not be robust to real world noise like flossy surfaces or motion blur.

# 3D Generative Models

Taking motivation from 2D generation, we use noise-sampling based approaches to build 3D scenes. While our 2D models are able to generate very high quality results, 3D models aren't able to match these outputs. The first limitation is due to the unavailability of data (Objaverse-XL 10M vs LAION 5B). The dataset itself has very simple models, so it is difficult to build highly-detailed models.

## Pretrained 2D Diffusion Models

How about [Lifting Pretrained 2D Diffusion Models for 3D Generation](https://arxiv.org/abs/2212.00774)? After the advent of NeRFs, this approach became feasible. The problem of creating a 3D model can be distilled to updated view-dependent 2D images! 

To this end, people tried using diffusion models for the generative capabilities. An optimal denoiser should understand the image structure. What does this mean? The model needs to understand that there is a low-dimensional image-manifold in a high-dimensional space. The noising process takes the image out of this manifold whereas the denoising process tries to bring it back to this space - A projection function.

An important question arises here - How does the denoiser know *which direction* to project on? The models typically project to the **weighted mean** (Gaussian likelihood based) direction of the training samples. This is known as **mean shifting** - used widely in clustering methods.

How is this relevant to 3D generation? When we start with white noise, the initial direction would be towards the mean of all training samples. [Elucidating the design space of Diffusion-Based Generative Models](https://openreview.net/pdf?id=k7FuTOWMOc7) examines this property in detail. The mean-shift essentially generates more 'likely' samples.

Start out with a 3D blob, add Gaussian noise (to take it to the space where the diffusion model has been trained on) and then denoise it. The noise function used is

$$
\partial \theta = \sum_i \mathbb E[w(\sigma) (\hat \epsilon_\phi (x_{c_i} + \sigma \epsilon) - \epsilon) \frac{\partial x_c}{\partial \theta}]
$$

Alternately, [DreamFusion: Text-to-3D using 2D Diffusion](https://arxiv.org/abs/2209.14988) tries to optimize using a KL divergence loss function but further derivation shows that it is equivalent to the above loss function. This noise function is called as **Score Distillation Sampling (SDS)**.

However, these still don't yield good results. Here, researchers realised that unconditional distribution is much harder than conditional generation. Unconditional generation is still an open problem.

For conditional generation, text prompts are able to generate results with higher-fidelity. Authors in DreamFusion added some more tricks wherein they decomposed the scene into geometry, shading, and albedo to improve the results.

### Mode-seeking

The score distillation sampling function (mean-shifting) has a mode-seeking behavior. This behavior is not necessarily good - it causes artefacts like saturated colors, lower diversity and fuzzy geometry. To alleviate these issues, there has been a new loss function crafted called **variational score distillation**.

### Improvements

- *Speed* - Sampling speed can be improved using Gaussian Splatting

-  *Resolution* - Resolution can be improved using Coarse-to-Fine refinement

## Alternative Approaches

### Multi-view 2D Generative Models

Fine-tune a 2D diffusion or any other generative model to generate multiple views of the same object. We pass in a single view of the object, and the generative model generates multiple views. This approach is explored in the paper [Zero-1-to-3: Zero-shot One Image to 3D Object](https://zero123.cs.columbia.edu). Then, NeRF or Gaussian splatting can be used to create the 3D models. The problem becomes "Images-to-3D" which is a much more easier problem.

The recovered geometry may not have very good - the 2D models do not understand the geometry of the scene quite well.

### Multi-view 2.5D Generative Models

Along with the RGB images, we could also estimate the normals to estimate the geometry better. This method is implemented in [Wonder3D: Single Image to 3D using Cross-Domain Diffusion](https://arxiv.org/abs/2310.15008), and it obtains better results.

---

At this point, the Objaverse-XL dataset was released, and people tried to train image to 3D directly - [LRM: Large Reconstruction Model for Single Image to 3D](https://arxiv.org/abs/2311.04400).

However, the issue with this approach is that since the dataset is object-centric and we want a more general model! Capturing such a general dataset is quite difficult.

An alternative idea could be to use videos as a dataset. Such an idea is explored in . Also, video generation is an achievable task with the current models - [Sora](https://openai.com/index/sora/). 

People are still figuring out other ways to solve this general problem, and it is a very lucrative field - hundreds of papers in the past year! 

Let us see some more papers which tried to address other issues in this problem.

## ReconFusion






