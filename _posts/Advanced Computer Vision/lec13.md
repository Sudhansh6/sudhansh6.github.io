To filter outliers, we will use the fundamental matrix as a model - it is a geometric property which all points have to abide by. However, the fundamental matrix itself is constructed from the detected features, which can be noisy. We need to design a robust method using heuristics to filter the outliers. We use a population-voting metric to choose the best model.

### RANSAC

Suppose we are finding the best-fit line for a given set of points. For every pair of points, we determine the corresponding line and count the number of outliers for that particular line. The best model would then be the on which has the minimum number of outliers.
This idea can be extended to any model, and it can be used to calculate the best fundamental matrix. The algorithm is as follows -

1. Randomly choose $$s$$ samples - typically $$s$$ is the minimum sample size to git a model (7 for a Fundamental matrix)
2. Fit a model to these samples
3. Count the number of inliers that approximately fit the models.
4. Repeat $$N$$ times
5. Choose the model with the largest set of inliers.

How do we choose $$N$$? It depends on the ratio of outliers to the dataset size, the minimum number of samples $$s$$ for the model and confidence score. We get

$$
N =  \frac{\log(1 - p)}{\log(1 - (1 - \epsilon)^s)}
$$

Where $$\epsilon$$ is the proportion of outliers and $$p$$ is the confidence score.

### Bundle Adjustment

Assuming we have a good $$R, t$$ robust to outliers with the above methods, we can now solve the least-squares problem to determine the scene geometry.

## Minimal Problems in computer Vision

<insert image>

### Three—point absolute pose estimation

Assume the intrinsics of the camera are known.
Determine the camera pose from given 3D-2D correspondences. Minimal case is 3 points: 6 degrees of freedom, 2 constraints per point $$(u, v)$$. Given $$p_1, p_2, p_3$$ in world coordinates, find positions In camera coordinates. Equivalently, determine how to move camera such that corresponding 2D-3D points align.

### Real-time SFM: Steady state

Suppose we have point-cloud and poses available at frame $$k$$, find the pose in frame $$k + 1$$. 

#### Option 1

Find correspondences between consecutive frames, estimate the essential matrix and find $$R, t$$. Keep repeating this as frames are read. 5 point estimation

#### Option 2

Estimate correspondences between point cloud and frame - 3 point absolute pose. Challenges - inliers calculations, which points to match. RANSAC maybe easier here. Option 1 is narrow baseline triangulation.

### Drift Problem

Absolute scale is undeterminable. Why does scale matter? Noise and RANSAC. External measurements to fix this. 

### Loop Closure

Retrieval mechanism 