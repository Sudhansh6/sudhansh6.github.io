CNNs typically have better inductive bias whereas transformers excel in shorter learning paths for long-range reasoning. However, the cost of self-attention is quadratic in the image size. Also note that, if the patch-size is too large, then we might lose the information within the patches. This is a tradeoff, and the decision is made based on the task at hand. For example, classification may work with large patches but tasks such as segmentation may not.

### Swin Transformers and Dense Prediction Transformers

The vanilla vision transformer is restricted to classification tasks and is not optimal for other tasks like detection and segmentation. Also, as we have noted before, the quadratic complexity limit the number of patches in the image. Some image processing pipelines extract features across different scales of an image whereas the vanilla transformer is restricted to the uniform (coarse) scale.

To address these limitations, **swin transformers** bring two key ideas from CNNs

- Multi-scale feature maps - Feature maps from one resolution are down sampled to match the size in the next block.
  
  ![](/assets/img/Computer%20Vision/2024-06-13-21-25-21-image.png)

- Local connectivity - 
  
  - Windowed self-attention - Limit the computations by considering a local window (this was actually left as future work in the original attention paper).
  
  - Shifted window self-attention - Allows windowed self-attention to learn long-range features using "shifts". Essentially, we move the patches around to bring farther patches close together.

However, these modifications are not enough for tasks like segmentation, which require reasoning at a pixel-level. Instead, we use something called as a *dense prediction transformer* (**DPTs**) where we couple the transformer encoder with a convolutional decoder to upsample and predict the required output.

>  CNNs are shift-invariant whereas ViTs are permutation invariant. Why?

![](/assets/img/Computer%20Vision/2024-06-13-21-32-22-image.png)

At each scale level in the above picture, we *reassemble* the tokens by concatenating and convolving with appropriate kernels to recover image-like representations in the decoder layers.

### Multimodality

Transformers allowed for easy multi-modal representations by tokenizing data from each modality with its own variant of *patches*. Works such as VATT have explored merging audio waveforms, text and images. 

# Generative Models

## Discriminative and Generative Models

Discriminative models (classifiers) learn a many-to-one function $$f$$ to learn labels for a given input. A generative model $$g$$ maps these labels to the input space, and this function is one-to-many since one label can map to multiple inputs. It is difficult to model a stochastic function. Therefore, a generator model is coupled with a *noise vector* to construct a deterministic $$g$$ with stochastic input $$z$$. This variable $$z$$ is called a **latent variable** since it is not observed in training data composed of $$\{x, y\}$$ pairs. 

$$
\begin{align*}
\text{Discriminative Models learn } P(Y \vert X) \\
\text{Generative Models learn } P(X, Y) \\
\text{Conditional Generators learn } P(X \vert Y) \\
\end{align*}
$$

Let us focus on image generative models. Then, each dimension of the latent variable can encode the various characteristics of the image essentially allowing us to generate a wide variety of images. The labels $$y$$ for images need not be classification labels, but textual descriptions can also be used for supervision.

To understand how these models work, consider the case of unconditional generative models. The goal is, given the real data $$x$$,  to generate synthetic data $$\hat x$$ that *looks like* the real data. How do we quantify 'looks like'?

- We can try and match some marginal statistics - mean, variance, edge statistics, etc of the real data. Such measures are very useful in techniques for texture synthesis. For example, [Heeger-Bergen texture synthesis [1995]](https://www.cns.nyu.edu/labs/heegerlab/content/publications/Heeger-siggraph95.pdf) uses an iterative process starting from the Gaussian noise and matches intensity histograms across different scales. Such design choices are used in modern techniques like [StyleGANs](https://en.wikipedia.org/wiki/StyleGAN) and [Diffusion models](https://en.wikipedia.org/wiki/Diffusion_model).

- Have a high probability of success under a model fit to real-data (A discriminator). 

The key-challenge in these models is novelity in the generation to ensure generalization. 

Generative models are classified into the following approaches -

- **Energy-based models** - Learn a scoring function $$s:X \to R$$ that scores real-samples with a high score which represents energy/probability. During generation, return samples which have a high score. This paradigm is particularly useful for applications like anomaly detection.

- **Sampling from Noise** - Learn a generative function $$g: Z \to X$$ without needing to learn a probability density function. These methods explicitly model the data distribution, and techniques like GANs and Diffusion Models come under this regime.
