# Introduction

Vision is a fundamental interface to the world, and it has become a crucial component in the development of intelligent systems. The field has deep and attractive scientific problems, which have been advancing at a rapid pace in the past few years.  
In the early days of research, the focus in vision was on engineering “good” features coupled with a optimisation algorithm or a shallow neural network. As the processors became more powerful, the emphasis shifted to end-to-end approaches with inclusion of self-supervision and multi-modal learning paradigms.

It is often helpful to breakdown the perception tasks into known-algorithms. For example, in autonomous driving, the tasks include SLAM (visual, Structure from Motion), path planning (lane detection, obstacle detection, 3D localization), Semantic segmentation etc. Similarly, the tasks in augmented reality devices are gaze tracking, material and lighting estimation, head pose estimation, depth estimation, etc.

Deep learning has opened new areas of research in vision. Features such as generation of high-quality content, end-to-end training, data-driven priors and highly parallelizable architectures have proven advantageous for many problems in computer vision. However, it is also important to note the limitations of these techniques -

- Large scale labeled data is not always available
- Lack of generalization to unseen domains
- Good at narrow “classification", not at broad “reasoning"
- Lack of interpretability
- Lack of reliability, security or privacy guarantee

To counter these problems, we typically couple our algorithms with self-supervision, physical modelling, multi-modal learning and *foundation models*. In the recent years, these techniques have been applied to various problems, and the following are arguably the biggest advances in Computer Vision -

- Vision Transformers
- Vision-Language Models
- Diffusion Models
- Neural Rendering

These techniques show promise to solve keystone problems in augmented reality, interactive robotics, and autonomous driving. The course will cover the following these topics, along with other fundamentals required.

- Neural Architectures

- Generative Models

- Structure from Motion

- Object Detection

- image Segmentation

- Prediction and Planning

- Inverse Rendering

- 3D GANs

- Vision-Language

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

The vanishing gradient problem in deeper networks has been solved using **skip connections** wherein the features from the earlier layers are concatenated with the deeper ones to allow passage of information. This way, we provide the network with the original input allowing it to learn the smaller fluctuations in the input (rather than focusing on learning the input itself). 

In summary, the key operations in convolutional layers are

```Input image -> Convlution -> Non-linearity -> Spatial Pooling -> Feature Maps```

CNNs have the above set of operations repeated many times. CNNs have been successful due to the following reasons

- Good Abstractions - Hierarchical and expressive feature representations. Conventional image processing algorithms relied on a pyramidal representation of features, and this methodology has also paved its way in CNNs.
- Good inductive biases - Remarkable in transferring knowledge across tasks. That is, pretrained networks can be easily augmented with other general tasks.
- Ease of implementation - Can be trained end-to-end, rather than hand-crafted for each task, and they can easily be implemented on parallel architectures. 

The key ideas - 

- Convolutional layers leverage the local connectivity and weight sharing to reduce the number of learnable parameters. 
- Pooling layers allow larger receptive fields letting us capture global features.
- Smaller kernels limit the number of parameters without compromising the performance much. This design decision comes from preferring deeper networks over wider networks. For example, $$(1 \times 1)$$ kernels are reduce the dimension in the channels dimension. 
- Skip connections allow easier optimization with greater depth.

> Why are (1, 1) kernels useful? Use fewer channels instead?

# Transformers

Transformers have shown better results in almost every task that CNNs have shone previously in. CNNs require significant depth or larger kernels to share information between non-local spatial locations (recall receptive fields). 

Many tasks, such as question-answering, require *long-range* reasoning and transformers are very good at this. For example, placing objects in augmented reality requires reasoning about light-sources, surface estimation, occlusion/shadow detection, etc. This is the primary intuition behind **attention mechanism** which is representative of foveated vision in humans.

![](/assets/img/Computer%20Vision/2024-04-11-12-10-13-image.png)

**Tokens** - A data type than can be understood as a set of neurons obtained from vectorizing patches of an image. Typically need not be vectors, but they can be any structured froup that alows a set of differentiable operations. Note that these tokens in hidden layers might not correspond to pixels or interpretable attributes.

The following captures a very good intuition for transformers.

*A transformers acts on tokens similarly as neural network acts on neurons. That is, combining tokens is same as for neurons, except tokens are vectors $$ t_{out }= \sum_i w_i t_i$$. In neural networks, linear layers are represented by $$x_{out} = W x_{in}$$ and $$W$$ is data-free, whereas in transformers, $$T_{out} = AT_{in}$$, $$A$$ depends on the data (attention). Again, non-linearity in neural networks is implemented via functions like ReLU whereas transformers use dense layers for non-linearity (applied token wise).*

The attention layer is a spsecial kind of linear transformation of tokens, wherein the attention function $$A = f(.)$$ tells how much importance to pay to each token depending on the input query and other signals. *Attention-maps* help us visualize the global dependencies in the information. The required information is embedded in some dimension of the token representation. For example, the first dimension can count the number of horses in an iamge, and the bottom 3 dimensions can encode the color of the horse on the right. Attention has this flexibility to different allocations address different parts of a query. They can "attend" to only certain patches *which are important to the query*. This kind of functionality is difficult with CNNs.

> Apply embedding and neural network (before CNNs and Transofrmers)? Same number of parameters? Essentially similar thing? Associated higher weight to more related embedding.
