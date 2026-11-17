Essentially, the training objective is to maximise log-likelihood over the data distribution. A variational lower bound can be derived and is used in practice

$$
\mathbb E_{q(x_0)}[-\log p_\theta(X_0)] \leq \mathbb E_{q(x_0) q(x_{1:T}\vert x_0)} \left[-\log \frac{p_\theta (x_{0:T})}{q(x_{1:T} \vert x_0)}\right]
$$

Then, this decomposes into

$$
\sum_{t > 1} D_{KL} (q(x_{t - 1} \vert x_t, x_0) \vert\vert p_\theta(x_{t - 1} \vert x_t)) + \text{other terms}
$$

The idea is that $q(x_{t - 1} \vert x_t, x_0)$ is tractable even though $q(x_{t - 1} \vert x_t)$ is not. That is because

$$
\begin{align*}
q(x_{t - 1} \vert x_t, x_0) &= \mathcal N(x_{t - 1}; \tilde \mu_t(x_t, x_0), \tilde \beta_t I) \\
\text{where } \tilde \mu_t(x_t, x_0) &= \frac{\sqrt{\bar \alpha_{t - 1}}}{1 - \bar \alpha_t}x_0 + \frac{\sqrt{1 - \beta_t} ( 1- \bar\alpha_{t - 1})}{1- \bar\alpha_{t - 1}}x_t \\
&=\tilde \beta_t = \frac{1 - \bar \alpha_{t - 1}}{1 - \bar \alpha_t} \beta_t
\end{align*}
$$

### Generative Adversarial Networks

In these architectures, a generator network tries to fool the discriminator by generating real-looking images. In contrast, a discriminator network tries to distinguish between real and fake images. GANs don't produce as good images as diffusion models, but the concept of adversarial learning is a crucial concept in many fields.  The framework looks like this - 

![](/assets/img/Computer%20Vision/2024-04-24-17-21-56-image.png)

The objective function for a GAN is formulated as a mini-max game - the generator tries to maximize the loss function whereas the discriminator tries to reduce it. 

$$
L = \min_{\theta_g} \max_{\theta_d} [\mathbb E _{x \sim p_{data}} \log D_{\theta_d} (x) + \mathbb E_{z \sim p(z)} \log (1 - D(G_{\theta_g}(z)))]
$$

The training is done alternately, performing gradient ascent on the generator and descent on the discriminator.

# Object Detection

Simply put, the goal is identify objects in a given image. The evolution of algorithms for object detection is summarized as 

- HoG + SVM - Sliding window mechanism for feature detection.

- Deformable Part Models (DPMs) - 

- **CNN** - The vanilla approaches with CNNs proposed sliding a window across the image and use a classifier to determine if the window contains an object or not (one class is background). However, this is computationally expensive because we need to consider windows at several positions and scales. Following this, **region proposals** were designed to find blob-like regions in the image that could be an object. They do not consider the  class and have a high rate of false positives which are filtered out in the next stages. Such class of methods are called **multi-stage CNNs** (RCNN, Fast-RCNN, Faster-RCNN) and are covered in detailed below.  On the other hand, the sliding window approach has been optimised using anchor-boxes and this class of detectors are referred to as **single-stage CNNs** (YOLO series) which have been discussed in the next section. For more details, interested readers could also refer to [my blog](https://sudhansh6.github.io/blog/Object-Detection/).

- **Transformers** - These methods are inspired from CNNs and have a transformer back-end. Examples include DETR and DINO discussed in later sections.

- Self-supervision

- Open vocabulary

## Multi-stage CNNs

### RCNN

For the region proposal network, an ImageNet pre-trained model (ResNet or like) is used. Since it has to be fine-tuned for detection, the last layer is modified to have 21 object classes (with background) instead of 1000 and is retrained for positive and negative regions in the image. The regions are then 

### FastRCNN

### FasterRCNN

Uses a Region Proposal Network (RPN) after the last convolutional layer. The RPN is trained to produce region proposals directly without any need for external region proposals. After RPN, the RoI Pooling and an upstream classifier are used as regressors similar to FastRCNN.
