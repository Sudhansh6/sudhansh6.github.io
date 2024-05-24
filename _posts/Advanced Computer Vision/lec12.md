## CTG++ - Language Guided Traffic Simulation via Scene-Level Diffusion

Testing autonomous agents in the real-world scenarios is expensive. Alternately, researchers aim to build good simulator that are realistic and can be controlled easily. 

Why not RL-based methods? Designed long-term reward functions is difficult for such scenarios. The goal here is in a generation regime rather than problem solving. Also, the focus here is on controllability rather than realism. For realism, the methods would be more data-driven.

### Trajectory Planning

Recent works have proposed diffusion-models for planning algorithms using classifier-guidance. *Diffuser* for example, is one such work where the authors generate state action pairs which are guided using a reward function to generate paths in a maze. 

### Traffic simulation methods

Early works for this task rrelied on rule-based algorithms which were highly controllable but not very realistic.

### CTG

One of the first workd for diffusion models for planning and conditional guidance for control with STL-based loss. Howeber, it modelled each agent independently which caused issues.

CTG++ uses **scene-level control** 

### Problem Formulation

The state is given by the locations, speeds and angle of $M$ agents whose past history and local semantic maps are given. We aim to learn a distribution of trajectories given this information. 

The encoder represents the state action pairs in an embedded space on which temporal and cross attention on a diffusion based loss for training/ 

### Inference

The model uses LLMs to generate code for guidance function. 

### Limitations and future work

CTG++ is able to generate more realistic example, but is still far-off from realism. There are no ablation studies or emperical evaluations with complicated scenarios. Also, the multi-agent modeling can be improved for scalability. 

In conclusion, trajectory prediction requires generative models which are able to distinugish between feasible and infeasible trajectories. Variational Auto-Encoders have shown good performance for this task, and the current works aim to explore the scope of diffusion models in these tasks. 

## LeapFrog - Stochastic Trajectory Prediction

Similar to CTG++, this model aims to simulate real-world traffic scenarios. The authors aim for real-time predictions and better prediction accuracy. Leapfrog initializer skips over several steps of denoising and uses only few denoising steps to refine the distribtuion.

### System Architecture

Leapfrog uses physics-inspired dynamics to reduce the number of steps required for the denoising process. The leapfrog initializer estimates mean trajectory for backbone of pericition, variance to control the prediction diversity and K samples simultaneously. 

### Limitations

The inference speed improved dramatically and achieves state of the art performance on the datasets. The model's efficiency is higher for lower dimensional data and requires more work for scaling to higher dimensions. 

# Structure from Motion

The problem statement for structure from motion is - given a set of unordered or ordered set of images, estimate the relative positions of the cameras and recover the 3D structure of the world, typically as point clouds. In scenarios like autonomous driving, the images are ordered and the emphasis is on real-time performance. 

## Feature Detection

The first step involves identifying matching features across images to determine the camera movements. In unordered feature matching, the images to be compared are identified using vocabulary based retrieval methods to reduce the complexity from $\mathcal O(n^2)$ to $\log$ complexity. 


In the canonical coordinate system, the camera axis passes through the origin, and the $k$-axis points away from the camera. The $i$-axis and $j$-axis are parallel to the image plane. The projection of 3D points in the pixel space involves a non-linear operation -

$$
(x, y, z) \to (-d\frac{x}{z}, -d\frac{y}{z})
$$

where $d$ is the distance of the camera plane from the origin. For computational reasons, we want to convert these to a linear transformation. This is done via homogenous point representations -

$$
\underbrace{(\frac{x}{w}, \frac{y}{w})}_\text{Euclidean} \to\underbrace{(x, y, w)}_\text{Homogenous}
$$

Such representations are useful for ray marching operations. The camera transformation then becomes

$$
\begin{bmatrix}-d & 0 & 0 & 0 \\ 0 & -d & 0 & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix} \begin{bmatrix}x \\ y \\ z \\ 1\end{bmatrix} =  \begin{bmatrix}-dx \\ -dy \\ z\end{bmatrix}
$$

which represents $(-d\frac{x}{z}, -d\frac{y}{z})$ in Euclidean space. The matrix above can be decomposed as 

$$
\underbrace{\begin{bmatrix}-d & 0 & 0  \\ 0 & -d & 0  \\ 0 & 0 & 1  \end{bmatrix}}_{K}\underbrace{\begin{bmatrix}1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix}}_\text{projection}
$$

Here, we have considered a simple model for the camera intrinsics matrix $K$ whose general form is

$$
\begin{bmatrix}-d_x & s & c_x  \\ 0 & -d_y & c_y  \\ 0 & 0 & 1  \end{bmatrix}
$$

where $\alpha = \frac{d_x}{d_y}$ is the aspect ratio (1 unless pixels are not square), $s$ is the skew, $c_x, c_y$ represent the translation of the camera origin wrt world origin.


### Coordinate Systems

We need to determine the transformations between the world and camera coordinate systems. Since camera is a rigid body, the transformation is represented by a translation and a rotation. Considering these, the projection matrix becomes

$$
\Pi = K \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0\end{bmatrix}\begin{bmatrix}R & 0 \\ 0 & 0 \end{bmatrix} \begin{bmatrix} T & - c \\ 0 & 0\end{bmatrix}
$$

## Problem Formulation

Given the projections $\Pi_i X_i \sim P_{ii}$, we aim to minimize a non-linear least squares of the form $G(R, T, X)$ - 

$$
G(X, R, T) = \sum_{i = 1}^m \sum_{j = 1}^n w_{ij} \cdot \left\|P(X_i, R_j, t_j) - \begin{bmatrix}u_{i, j} \\v_{i, j}\end{bmatrix} \right\|^2
$$

This problem is called as **Bundle Adjustment**. Since this is an non-linear least squares, Levenberg-Marquardt is a popular choice to solve this. In theory, given enough number of points, we should get a unique solution. However, practically, we require a very good initialization to navigate the high-dimensional space. Also, outliers in the feature detection can deteriorate the performance of the model drastically.

## Tricks for Real-world performance

Basically, we aim to make the feature detection very robust to remove all the possible outliers. Towards that, we note the following background

#### Fundamental Matrix

Given pixel coordinates $x_1, x_2$ of a point $x$ in two camera views, we define a fundamental matrix $F$ such that $x_1Fx_2 = 0$. The fundamental matrix is unique to the cameras and their relative configuration. It is given by

$$
\begin{align*}
F &= K_2^{-T} E K_1^{-1} \\
E &= [t]_{\times} R
\end{align*}
$$

where $R$ and  $[t]_\times$represent the relative base transformations given by

$$
[t]_X = \begin{bmatrix} 0 & -t_z & t_y \\ t_z & 0 & -t_x \\ -t_y & t_x & 0\end{bmatrix}
$$

The matrix $E$ is called as the essential matrix which has similar properties as the fundamental matrix and is also independent of the camera parameters. 

The fundamental matrix is scale-invariant and has rank $2$. Therefore, it has $7$ degrees of freedom implying that we just need $8$ correctly configured points ($x$ and $y$) across the two pixel spaces to compute the fundamental matrix. We pose this problem as solving $Af = 0$ - minimizing $\|Af\|$ using SVD (to directly operate on the rank). This procedure is popularly known as the $8$-point algorithm. Furthermore, we can also use this to find the camera parameters by using more points.

The essential matrix can be derived from $F$ using $RQ$ decomposition to obtain skew-symmetric and orthogonal matrices $[t]_\times$ and $R$.  These matrices are what we were looking to determine - the relative configuration of the cameras with respect to each other. Now, triangulation can be used to locate $x$ in the 3D space. However, this may not work since the projection lines may not intersect in 3D space. 



