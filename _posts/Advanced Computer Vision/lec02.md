---

---
Limits of supervised deep learning
• Large scale labeled data is not always available
• Lack of generalization to unseen domains
• Good at narrow “classification”, not at broad “reasoning”
• Lack of interpretability
• Lack of reliability, security or privacy guarantee

In the recent years, the four big advances in computer vision can arguably be summarized as 

- Vision Transformers
- Vision-Language Models
- Diffusion Models
- Neural Rendering

The course will cover the following topics - 
- Autonomous driving 
- 3D content creation
- Vision and Language

> Demonstrate code in presentation

### Neural Architectures
The motivation for an artificial neuron (perceptron), comes from a biological neuron where the output is linear combination of the inputs combined with a non-linear activation function. From here, we develop multi-layer networks which are again motivated from the Hubel and Weisel's architecture in biological cells. 

### Neural Networks
The simplest neural network is a perceptron represented by $$ \sigma (x) = \text{sign}(\sum_i w_i x_i + b)$$ where the optimal weight values are obtained using an unconstrained optimization problem. These concepts can be extended for "Linear Regression" and "Logistic Regression" tasks.

Non-linearity in neural networks is introduced through **Activation functions** such as 
- Sigmoid - Have vanishing gradient issues
- tanh - Centered version of sigmoid
- ReLU - Simplest non-linear activation, with easy gradient calculation.
- ELU - Added to prevent passive neurons.

At the **output layer**, we apply a final non-linear function is applied to calculate the **loss** in the predicted output. Typically for **classification problems**, *Softmax* function is used to map the network outputs to probabilities. One-hot representations are not differentiable, and are hence not used for this task. In image synthesis problems, the output layer usually has $$255*sigmoid(z)$$. 

**Theorem (Universal function approximators)**: A two-layer network with a sufficient number of neurons can approximate any continous function to any desired accuracy. 

**Width or Depth?** A wider network needs more and more neurons to represent arbitrary function with high enough precision. A deeper network on the contrary, require few parameters needed to achieve a similar approximation power.
However, "overly deep" plain nets do not perform well. This is due to the vanishing gradient problem, wherein we are not able to train deep networks with the typical optimization algorithms.

### Convolution Networks
The neural network architecture is modified for images using "learnable kernels" in convolutional neural networks. Each convolution layer consists of a set of kernels that produce feature maps from the input. These feature maps capture the *spatial* and *local* relationships in the input which is crucial for images.

The *induction bias* in images is that neighbouring variables are locally correlated. An image need not be 2D, it can consist of multiple channels (RGB, hyperspectral, etc.), and convolutional layers work *across all* these channels to produce feature maps. 

In a classical neural network, each pixel in the input image would be connected to every neuron in the network layer leading to *many* parameters for a single image. Using kernels, we use *shared weights*
across all pixel locations, and this greatly reduces the number of learnable parameters without losing much information. 

Convolution layers are generally accompanies with **Pooling layers** which do not have any learnable parameters, and are used to reduce the size of the output. These layers are invariant to small (spatial)transformations in the input and help observe a larger *receptive field* in the next layer. The latter property is important to observe hidden layers in the feature maps.

**Receptive Field** - It is the area in the input iamge "seen" by a unit in a CNN. Inits with deeper layers will have wider receptive fields whereas wider receptive fields allow more global reasoning across entire image. This way, the pooling leads to more rapid widening of receptive fields.
We need $$\mathcal O(n/k)$$ layers with $$(k \times k)$$ convolutional filters to have a receptive field of $$ n $$ in the input. *Dilation layers* are used to achieve the same receptive field with $$\mathcal O(\log n)$$ layers.

However, in practice, the empirical receptive fields in the deeper networks is lower than the theoretical value due to sparse weights.

Convolution networks are augmented with *dense* layers to get the output, to learn from the feature maps. 

In summary, the key operations in convolutional layers are

```Input image -> Convlution -> Non-linearity -> Spatial Pooling -> Feature Maps```

CNNs have the above set of operations repeated many times. CNNs have been successful due to the following reasons
- Good Abstractions - Hierarchical and expressive feature representations
- Good inductive biases - Remarkable in transferring knowledge across tasks
- Ease of implementation - Can be trained end-to-end, rather than hand-crafted for each task, and they can easily be implemented on parallel architectures.

### 


