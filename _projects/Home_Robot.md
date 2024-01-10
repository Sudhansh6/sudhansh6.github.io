---
layout: page
title: Perception for Home Robot
category: research
importance: 1
description: Experimenting with various NeRF and Gaussian Splatting based SLAM algorithms to build a real-time 3D reconstruction of the environment. The methods used include NeRF-SLAM, Nice SLAM, Mip-NeRF and Splatam. 
img: /assets/video/homerobot.gif
---

Check out this [repository](https://github.com/DoongLi/awesome-Implicit-NeRF-SLAM) for all the latest papers relating to NeRF-SLAM.

# [NeRF-SLAM](https://github.com/ToniRV/NeRF-SLAM)

The paper proposes a novel geometric and photometric 3D mapping pipeline for real-time scene reconstruction from monocular images. 

While many 3D reconstruction solutions are based on RGB-D or Lidar sensors, scene reconstruction from monocular imagery provides a more convenient solution. RGB-D don’t work well in different lighting conditions, LIDARs are expensive, and stereo cameras have calibration problems. However, even with the improvements due to deep- learning, building both geometrically and photometrically accurate 3D maps of the scene from a casually taken monocular video in real-time is not currently possible.

> The geometric deals with the relation between 3D objects and their views under parallel, perspective, and central projection. The photometric deals with the relation between 3D matte objects and their images under changing illumination conditions.
> 

Neural Radiance Fields are a photometrically accurate 3D representations of the world. However, they require costly volumetric rendering, and they also originally required ground-truth pose estimates to converge. The fundamental problem of NeRF representations, given no depth supervision, is that the parameterization of the surfaces by a density is prone to ‘floaters’, ghost geometry that appears because of bad initializations or convergence to bad local minima. Depth supervision significantly improves the performance of the pipeline.

The idea is that, a dense monocular SLAM pipeline can be used for close-to-perfect pose estimates, together with dense depth maps to build NeRFs on the fly. 

### Dense SLAM

SLAM refers to estimation of pose and depth. The main challenges for depth SLAM are

- computational complexity - dealt by decoupling pose and depth estimation.
- dealing with ambiguous information - Avoided with RGB-D or LIDARs.

Traditional dense SLAM techniques that achieved real-time computation include [DTAM](https://www.doc.ic.ac.uk/~ajd/Publications/newcombe_etal_iccv2011.pdf) and [ElasticFusion](https://www.roboticsproceedings.org/rss11/p01.pdf), but they are unable to make plausible geometry estimation for unobserved regions.


### Neural Radiance Fields (NeRFs) 

NeRFs allow capturing view-dependent effects while maintaining multi-view consistency. NeRF synthesizes novel views (a rendering algorithm) of complex scenes by optimizing an underlying continuous volumetric scene function using a sparse set of input views. [The vanilla NeRF approach](https://dl.acm.org/doi/pdf/10.1145/3503250) represents a scene using a  fully connected (non-convolutional) deep network, whose input is a single continuous 5D coordinate (spatial location (x, y, z) and viewing direction (θ, φ)) and whose output is the volume density and view-dependent emitted radiance at that spatial location. The model learns a continuous volumetric function that can output the color and volume density to any voxel in space. To learn more about NeRF in detail, visit [this](https://dtransposed.github.io/blog/2022/08/06/NeRF/) article. Here is a general overview of the NeRF pipeline -

1. We have a set of “poses” in the form of (θ, φ) (3rd parameter not needed for pose since the camera always points at the object). We get the vector representation $v_0, v_d$ (origin, direction) for each pixel in every pose image. So, we get $H*W*n$ such rays for an image plane of size $H*W$ and $n$ poses.
2. Next, we need to sample the points on these rays that are relevant to the object. That is, we need to sample points that are not in the empty space, but on the object itself. Also, we need to ensure that the sampling is done proportional to the expected effect on the final rendering. We can parameterize the ray and sample the points with a high $t$, but it is not that simple. The authors use a “hierarchical volume” sampling for this.
3. The voxels are then mapped to a high dimensional space for better performance on high-frequency details like textures and colors. Neural networks are known to approximate low-frequency functions rather than high-frequency. The authors correct for this by introducing an encoding function $\gamma(p)$ that takes a voxel $p$ and maps to high-dimensional spaces like $sin(\pi p), cos(2\pi p)$, etc. This is called _positional encoding_. 
4. The final step is neural inference and volume rendering. The query points (obtained above) are fed into the neural network to obtain $c (r, g, b), \sigma$, that can be used to obtain the volume density profile for each ray. 
5. In the volume rendering step, we take this output and get the rendered images. The information along a ray is aggregated using the **rendering equation**. In computer graphics, the rendering equation is an integral equation in which the equilibrium radiance leaving a point is given as the sum of emitted plus reflected radiance under a geometric optics approximation. Here, since the rays are straight, the equation simplifies to a simple sum along the ray. The idea is that, the ray has a higher probability of stopping (from the viewer to the object) if the volume density is high at that point. The color at that point will have the most effect in the final rendered image. Therefore, we use the volume density as weights for the colors to obtain the final RGB value in the image.
    
    Why not just outer-shell rendering instead of volume?
    
    Where is reflectance being taken care of? Also, how are shadows being taken care of?
    
6. The loss is then calculated by calculating the MSE between the ground truth image and the rendered image. 

There has been a lot of development on this line of work, which provide faster training, faster computations and better looking results. 

For example, [Plenoxels](https://alexyu.net/plenoxels/) (Plenoptic volume element) improved the speed by parameterizing the directional encoding using spherical harmonics without using an MLP at all! Basically, they showed that the exceptional performance of NeRFs is due to the differentiable volume rendering function rather than the implicit neural representation. [This article](https://deeprender.ai/blog/plenoxels-radiance-fields-without-neural-networks) explains in detail the physics behind rendering and the motivation behind plenoxels.

Finally, [Instant-NGP](https://nvlabs.github.io/instant-ngp/) shows that with a hash-based hierarchical volumetric representation of a scene, it is possible to train a neural radiance field in real-time. The authors propose to learn a multi-resolution hashtable that maps the query coordinates to feature vectors. The encoded input feature vectors are passed through a small MLP to predict the color and density of a point in the scene, NeRF-style. Check [this article](https://www.casualganpapers.com/fastest_nerf_3d_neural_rendering/Instant-Neural-Graphics-Primitives-explained.html) to understand the key-ideas in the paper.

### SLAM with NeRFs

An area of research in NeRFs focuses on removing the dependence on partially known camera poses. [iNeRF](https://yenchenlin.me/inerf/) is an interesting framework that performs pose estimation by “inverting” a trained NeRF. Following this, [iMap](https://arxiv.org/pdf/2103.12352.pdf) and [Nice-SLAM](https://arxiv.org/pdf/2112.12130.pdf) (an extension of iMap) showed how to build accurate 3D reconstructions, without the need for poses! Now, this work builds on these two approaches (which use RGB-D) input, to work with monocular images. Some works also use a hierarchical volumetric map for real-time SLAM with monocular images. The paper aims to build an indirect loss for pose-estimation, which is known to be more robust than direct image alignment, and has the ability to **depth supervise the radiance field**. 

To summarize, dense monocular SLAM estimates dense depth maps and camera poses, while also providing uncertainty estimates for both. This is used for the training of NeRF. The paper uses real-time implementations of both these parts, and runs them in parallel to obtain better performance in real-time. 

### Tracking: Dense SLAM

[Droid-SLAM](https://arxiv.org/pdf/2108.10869.pdf) is used as the tracking module to provide dense depth maps and poses for every keyframe. This is done via computing dense *optical-flow* between pairs of frames using a ***convolutional Gated Recurrent Unit (GRU)***. 

> Check [this article](https://towardsdatascience.com/illustrated-guide-to-lstms-and-gru-s-a-step-by-step-explanation-44e9eb85bf21) for a detailed explanation of what this term means.
> 

The module solves a dense bundle adjustment (BA) problem where the 3D geometry is parametrized as a set of inverse depth maps for keyframe. (Not really sure what this means). 

### Mapping: Probabilistic Volumetric NeRF

Now that the dense depth-maps are available, these can be used to supervise the neural volume. The resulting point-cloud from dense monocular SLAM, is however noise and contains large outliers. based on the works in [Probabilistic Volumetric Fusion
for Dense Monocular SLAM](https://arxiv.org/pdf/2210.01276.pdf), the uncertainties in depth estimates can be used to weigh the depth values for classical *TSDF volumetric fusion*.

> TSDF - Truncated Signed Distance Function
> 

Comments -

- This is for large-scenes? We need for small items on the table?

## [Zip-NeRF](https://arxiv.org/pdf/2304.06706.pdf)

The idea is to use grid-based representations to accelerate the training of NeRFs. However, these approaches are limited by aliasing. Anti-aliasing has been previously corrected for in [mip-NeRF 360](https://jonbarron.info/mipnerf360/), which reasons about sub-volumes along a cone rather than points along a ray. Zip-NeRF combines the techniques from Instant NGP and mip-NeRF 360. 

mip-NeRF 360 has been designed to work with unbounded scenes, where the background has a lot of information in terms of various objects. This is done in the following way -

- The unbounded space is represented in a bounded domain using a Kalman-filter like transform to warp the Gaussians (used by the conic slices).
- Unbounded scenes can require heavy computation. The paper addresses this problem by distilling scene geometry using a large NeRF MLP to a small MLP while training.

- A novel regularizer along mip-NeRF ray intervals to solve for sparse observations in large scenes (highly ill-posed problem)

Current grid-based approaches do not use positional encoding, but instead use learned features that are obtained by interpolating into a hierarchy of grids at a single 3D coordinate. 

Mip-NeRF 360 and iNGP are similar in the sense that they sample points along the camera rays to train a continuous volume density and color function. However, they differ significantly in how the coordinates along the ray are parameterized. 

- In mip-NeRF 360, a ray is subdivided into a set of intervals, each of which represents a conical frustum whose shape is approximated using a multivariate Gaussian, and the expected positional encoding is used as input to the MLP. This approach is scale-aware.
- iNGP trilinearly interpolates into a hierarchy of differently-sized 3D grids to produce feature vectors for small MLP

### Spatial Anti-Aliasing

### z-aliasing and Proposal Supervision

Comments -

- This is useful when the background is information rich.
- Don’t we need 360 views?


# Gaussian Splatting

**[3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)**

**[GS-SLAM: Dense Visual SLAM with 3D Gaussian Splatting](https://arxiv.org/abs/2311.11700#:~:text=In%20this%20paper%2C%20we%20introduce,balance%20between%20efficiency%20and%20accuracy.)**

No code yet!

300 fps apparently!

**[Photo-SLAM: Real-time Simultaneous Localization and Photorealistic Mapping for Monocular, Stereo, and RGB-D Cameras](https://arxiv.org/abs/2311.16728)**

No code yet!

300 fps apparently!


### Useful links

- https://huggingface.co/blog/gaussian-splatting

- https://www.linkedin.com/pulse/recon-labs-internal-open-seminar-3-nerf-gaussian-splatting-ou2he/

- https://www.toolify.ai/ai-news/revolution-in-3d-imaging-photogrammetry-vs-nerf-vs-gaussian-splatting-79775

- [Detic](https://github.com/facebookresearch/Detic)

- [Segment-Anything (SAM)](https://github.com/facebookresearch/segment-anything)

- [Grounded Segment-Anything](https://github.com/IDEA-Research/Grounded-Segment-Anything)