--- 

layout: post
title: Structural Visualization for Neural Networks
categories: [Research]
description: Analysing learning patterns in neural networks using graph visualization algorithms.

---

# Introduction

The structure of neural networks have been motivated from neurons in brains. Just like how brain has specialized regions for analysing different kinds of data, do neural networks have such mappings? Is there a way we can visually monitor this, analyse patterns and comment on the progress of training of the model?

In simpler neural networks, the outputs from each layer can be visualized as linear separating functions. Such interfaces are available on websites like Tensorflow palyground. Other visualization methods like t-SNE, aim to classify data points in high dimensional spaces. Combining such approaches, the paper [Visualizing the PHATE of Neural Networks](https://arxiv.org/abs/1908.02831) uses a kernel-based simentionality reduction

> **t-SNE** is a statistical method to visualize high-dimensional data in two or three dimensional maps. The approach involves constructing a probability distribution over pairs of objects such that similar objects have a higher probability. Then, it uses KL-divergence to model a similar distribution in the low-dimensional space for visualization. [UMAP](https://en.wikipedia.org/wiki/Uniform_manifold_approximation_and_projection) is another approach for this task. To read in detail refer to the [Wiki](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding).

# Multi-layer Perceptrons

The basic setup boils down to the graph drawing problem where we try to find a layout to better visualize a given graph $$G= (V, E)$$. There are two approaches to this problem -

- **Force-directed layout** - Adds a potential field representing force on edges of the graph to help them spread out

- **Spectral layout** - USes coordinates the eigenveectors of a matric such a the Laplacian derived from the degree matrix and adjacency matrix of the graph.

### Graph Construction

Use KNN similarity with spectral layout as the warm start, and then use the force-directed layout to plot the graph. But what do all these mean in the context of latent spaces of a neural network?

$$
h_i^{(l)} = \phi^{(l)} \left(\sum_{i \in [k]} x_i w_i^{(l)} + b^{(l)}\right)
$$

Consider the task of classification. What are we trying to visualize? Either the samples or the model weights can be visualized. Let us look at the samples.

### Results

Through out the triaining process, inter-class nodes will gradually move further while the intra-class nodes move closer. 

### Experiment - Sensitvity Mapping

Do some embeddings contribute more on the final prediction? We can try visualizing the gradients contributed by the samples at each hidden layer. 

### Experiment - Neuron x Sample Mapping

Can we add neurons alongside samples as nodes in the graph? The idea is as follows -

- Represent neuron nodes with black nodes and samples nodes as colored ones

- No connectiones between colored nodes and black nodes

- A sample node is adjacent to a neuron node if the neuron node 

The motivation for this experiment is to figure out if some of the embeddings contribute more on the final prediction.

# Observing Domains in Generative Models

Focusing on VAE models, which are characterized with an encoder-decoder architectures to reduce the reconstruction loss (for the decoder) and simialrity loss (for the encoder). The assumption is that any input can be mapped to a lower-dimensional distribution which can then be sampled with a conditional variable to reproduce the high-dimensional input. The similarity loss acts like a regularization term, forcing the distribution learnt by the encoder to match the normal distribution. Depending on the application, the weight of the similarity loss (represented by $$\beta$$) can be varied. 

Increasing this parameter to a high value causes *posterior collapse*, reducing the generalizability of the network. Essentially, the network generates only a certain instance/class from the distribution.

### Relevant Work

[Variational Autoencoders Pursue PCA Directions (by Accident)](https://ar5iv.labs.arxiv.org/html/1812.06775#:~:text=Variational%20Autoencoders%20Pursue%20PCA%20Directions%20%28by%20Accident%29%201,3%20Results%203.1%20The%20problem%20with%20log-likelihood%20) is one such works that claims that the decoder models will promote orthogonality when transforming the z-embedding to the final output. The question of using this behavior to help us model data better is still an open question.

## Conclusion

These approaches can be used for the following 

- Learning with trainability - Visualizing the entire course of training instead fthe final model.

- Learning towards interpretability - Visualizing why models behave in certain ways through the lens of a graph

- Learning towards robustness - Visualizing scrambled data points 
