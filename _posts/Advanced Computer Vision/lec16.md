# Neural Fields

The central question associated with neural fields is "what can be seen?". That is, how can we measure what we see and how to model it for further computations? This question is important to not only the researchers in Computer Graphics but also in a field called Plenoptic Functions. It is basically the bundle of all light rays in a scene - a 5D function parametrized by position ($$x, y, z$$) and viewing direction ($$\theta, \phi$$). Neural Fields aim to approximate this function for a scene using Neural networks.
Our core problem is that we have 2D slides and we need to estimate a 5D function. This problem is referred to as Image-based Rendering. It was taken into serious consideration in literature with the advent of the digital Michaelangelo project by Stanford, wherein researchers reconstructed the 3D models of all the sculptures in the Louvre museum.
A closely related problem called "view synthesis" aims to generate images from views not present in the training data. In this problem, the 5D function is simplified to a 4D light field (rays passing through 3D space). Images are then captured from multiple view points, and **novel view** synthesis is done via interpolation with the closest rays. 
The earliest work in virtual reality by Sutherland in 1968, which talks about view synthesis and the ideas introduced in this paper are still relevant till date. The problem also gained interest in the graphics community - Chen et. al in SIGGRAPH 1993 talks about representing 3D models using images. However, researchers viewed view-synthesis as a small part of overall 3D scene understanding.

## Perfect 3D understanding

Research then aimed to solve this problem rather than view synthesis. How is it different? In view syntheis, there is no information regarding the geometry of the scene itself. We want to infer the structure of the scene as well. 
So, how do we estimate the geometry of the scene? 

### Image-Depth Warping

As we have seen earlier, one of the first approaches for this problem was to perform feature detection and matching to triangulate points in 3D space. This core approach is being used in Depth from Stereo, multi-view stereo, 3D reconstruction, SLAM and so on. However, the output from these techniques is a *point cloud* which is sparse and contains "holes" which are not useful for the "structure of the scene".

#### Surface reconstruction

Another subfield of graphics/vision tries to estimate the surface from these points clouds. There were methods using Local Gaussians, Local RBF functions, Local Signed Distance functions, etc. The famous approaches for this problem is Poisson surface reconstruction and Neural Signed Distance functions. In a way, Gaussian splatting is a surface reconstruction technique.

### Space Carving

The underlying idea is motivatede from how humans create a sculpture - start out with a block, and carve/chip out regions that are not consistent with the camera viewpoints. However, this does not work well if there are not enough view points of the object (imaging back-projection problem in tomography).

### Using Depth data

Suppose we have the depth information of each pixel as well - in such scenario, dealing with occlusions and "best-view planning" for 3D reconstruction becomes quite easy. 

### The slump

Between 2005 and 2014, there wasn't much work done in the area of view synthesis, but many researchers focused on solving sub-problems in 3D scene understanding. There were papers for single-view depth estimation with a variety of diverse approaches.
Along with these advances, the camera technologies also improved rapidly. Multi-array cameras were improved to hand-held cameras with much better resolution. The sensors to capture depth also improved - structured light was used in the past which did not work well in real-life scenarios. In contrast, we now have LIDARs to capture depth accurately and instantly. Given these advances, large-scale datasets came into place. KITTI dataset is one such famous dataset still being used as a benchmark for autonomous driving applications today. 
On the other front, GPUs improved exponentially, and the deep learning architectures grew better - ImageNet, Resnet, and other advances. 
With all these advances together, the focus on 3D reconstruction was on the rise again. Approaches using deep CNN networks, sparial transformer networks, etc were being applied to these problems. One key idea introduced in spatial transformer networks is **differentiable samplers**, which is an important property approaches aim to have now too.

## 3D understanding with Modern Tools

Since monocular reconstruction did not yield good results due to disocclusion problems, works focused on RGB$$\alpha$$ planes wherein the depth was captured by **multi-plane images**. To get the image from a novel view point, **alpha compositing** is used to render the image. 
At this point, since we have perfect depth and color data from a viewpoint, we should be able to generate new views with ease. However, the novel views that can be generated are limited by single view data. Then, the idea of using multiple images of a scene started entering the literature.

> What is the difference between depth map and MPI? Both capture the depth of the scene.
> Fast forward into the future, NeRFs started using multiplane images for each pixel rather than a single image. 

## Neural Radiance Fields

Alpha-composting is used to generate the value of each pixel in the rendering image, along with which, continuous volume rendering is done to represent the scene itself -

$$
C_0 = \int C_t \sigma_t \exp\left(-\int \sigma_u du\right) dt
$$

which is discretized as 

$$
C_0 = \sum_i C_i \alpha_i \prod_j (1 - \alpha_j)
$$

Here, $$\sigma_t$$ and $$\alpha$$ are related to the transmittance/opacity of the pixel. The idea is that we shoot out a ray corresponding to a pixel in the camera image, sample points on the ray (ray-marching) to estimate their opacities and color.
Neural networks are used to calculate the opacity for each spatial point and color value depending on the spatial location and viewing direction. The color depends on viewing direction because of BRDF functions that vary based on the viewing direction (image specular surfaces).
Using the positions and viewing directions directly does not yield good results. Why? It is difficult to estimate high-frequency parameters required for images from these low-dimensional values. Neural networks tend to estimate low-frequency functions over high-frequency functions. To solve this, these coordinates are mapped to a high-dimensional space using **positional encoding**. This addition yields much superior results.
Since the whole framework is completely differentiable, it is easy to find the optima minimizing the error across multiple camera views.
NeRF was a very influential paper, enabling applications in new fields such as text-to-3D and it embodies the perfect combination of the right problem, at the right time, with the right people.

# Mip-NeRF 360

The original paper has two major assumptions - 

- Bounded scenes
- Front-facing scenes - camera views are limited to certain directions

The outputs from NeRF had a lot of aliasing issues when these assumptions are broken. Instead of assuming rays shooting out from the camera, Mip-Nerf shoots out conical frustrums with multivariate Gaussians to represent 3D volumes in the scenes. This solves the problem of front-facing scenes. 
To solve the problem of unbounded scenes, Mip-NeRF 360 uses "parameterization" to warp the points outside a certain radius using Kalman Filtering. Essentially, farther points are warped into a non-Euclidean space which is a tradeoff - for applications in SLAM and robotics, the geometry may be precisely needed which is sort of lost in such transformations.
To speed up training in unbounded scenes, the authors proposed "distillation", wherein sampling is done in a hierarchical manner to identify regions with higher opacities. These higher opacity regions are then used to estimate the color in the finer-sampled regions. To supervise the training of "density finding network", the idea of distribution matching in multi-resolution histograms is used to formulate a loss function.
Given limited number of camera, it is difficult to estimate all the parameters correctly - causing artefacts in the reconstructions. To solve this, the authors use a **distortion regularizer** to clump together points with higher densities. This acts as a prior to resolve some ambiguities in the scene.

- 
