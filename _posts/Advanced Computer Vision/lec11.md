### Representation Framework

The past observed trajectories are represented by X = \{X_{i, t - l + 1}, \dots, X_{i, t}\} usng we which we wish to predict future trajectory Y_i = \{Y_{i, t + 1}, \dots, Y_{i, t + \delta}\}. The parameter \delta represents how far ahead we want to look in the future.

The *sample generation module* produces future hypotheses \hat Y, and then a ranking module assigns a reward to each hypothesis considering long-term rewards. Following this, the refinement step calculates the displacement \Delta Y_t for the selected trajectory.

Focusing on the sample generation module, the goal is to estimate posterior P(Y \vert X, I). Earlier, RNNs and other deterministic function maps from \{X, I\} to Y have been designed to address this. The problem with training in this approach is that the ground truth has a single future trajectory whereas the sampler predicts a distribution. How do we compare the two?

## Principal Component Analysis

Principal component analysis (PCA) is a linear dimensionality reduction technique where data is linearly transformed onto a new coordinate system such that the directions (principal components) capturing the largest variation in the data can be easily identified. PCA works well when the data is near a **linear manifold*** in high dimensional spaces.

CAn we approximate PCA with a Network? Train a network with a bottleneck hidden layer, and try to make the output the same as the input. Without any activations, the neural network simply performs least-squares minimization which essentially is the PCA algorithm.

Adding non-linear activation functions would help the network map non-linear manifolds as well. This motivates for autoencoder networks.

## Autoencoders

Network with a bottleneck layer that tries to reconstruct the input. The decoder can map latent vectors to images essentially helping us reconstruct images from a low-dimension. However, this is not truly generative yet since it learns a one-to-one mapping. An arbitrary latent vector can be far away from the learned latent space, and sampling new outputs is difficult.

## ###  Variational Autoencoder

This network extends the idea in autoencoders and trains the network to learn a Gaussian distribution (parametrized by $\mu, \sigma$) for the latent space. After learning, say, the normal distribution, sampling is quite easy to generate new samples representative of the trianing dataset using the decoder.

To train this network, a distribution loss, like the KL-divergence is added in the latent space. But how do we backpropagate through random sampling? The reparametrization trick!

### Conditional Variational Autoencoder

The encoder and decoder networks are now conditioned on the class variable.

## Conditional Diffusion Models

Gradient of log, score function, conditioning at the cost of diversity - train a classifier and a diffusion model together in principle it's fine. Potential issues - classifier can't learn from noisy images and gradient of the classifier is not meaningful. 

## Classifier-Free Guidance

learn unconditional diffusion model $p_\theta(x)$ and use the conditional model $p_\theta(x \vert y)$ for some part of the training. this would not require any external classifier for training. 
