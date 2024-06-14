## Density/Energy based models

Learn a scoring function $$s:X \to R$$ that scores real-samples with a high score which represents energy/probability. During generation, return samples which have a high score. This paradigm is particularly useful for applications like anomaly detection.

In these methods, we produce $$p_\theta$$ fit to the training data by optimizing $$\arg\min_{p_\theta} D(p_{\theta}, p_{data})$$. Since we don't know $$p_{data}$$ explicitly (we only have access to samples $$x \sim p_{data}$$), we minimize the **KL-divergence** to reduce the distance between the distributions using the samples.

$$
\begin{align*}
p_\theta^* &= \arg\min_{p_\theta} KL(p_{data} \vert\vert p_\theta)\\
&= \arg\max_{p_\theta} \mathbb E_{x\sim p_{data}}[\log p_\theta] - \mathbb E_{x\sim p_{data}}[\log p_{data}] \\
&= \arg\max_{p_\theta} \mathbb E_{x\sim p_{data}}[\log p_\theta]
\end{align*}
$$

Intuitively, this way of optimization increases the density where the models are observed.

The energy-based models have a slight modification wherein the energy function $$E_\theta$$ is unnormalized unlike the probability density function $$p_\theta$$. Indeed, $$p_\theta$$ can be determined as

$$
\begin{align*}
p_\theta &= \frac{e^{-E_\theta}}{Z(\theta)}, \\
&\text{ where } Z_\theta = \int_x e^{-E_{\theta}(x)} dx
\end{align*}
$$

This formulation is called as *Boltzmann or Gibbs* distribution. Learning energy function is convenient since normalization is intractable since we cannot see all the samples in the distribution. What is the motivation to use exponential functions?

1. It arises naturally in physical statistics

2. Many common distributions (Normal, Poisson, ...) are modeled using exponential functions.

3. Want to handle large variations in probability

Although we don't have the probabilities, we can still compare different samples using ratios of their energies. 

After obtaining the energy distribution, how do we use it to sample in these approaches? Sampling approaches **Markov Chain Monte Carlo** (MCMC) only require relative probabilities for generating data. We can also find data points that maximize the probability.

$$
\nabla_x \log p_\theta(x) = -\nabla_x E_\theta(x)
$$

On the other hand, where would be prefer probability formulation over energy? Certain systems like safety in autonomous driving require absolute quantifiable probabilities rather than relative scores.

In probability modeling, the probability of space where no samples are observed is automatically pushed down due to normalization. However, in energy based models, we need an explicit negative term to push energy up where no data points are observed. To do so, we set up an iterative optimization where the gradient of the log-likelihood function naturally decomposes into contrastive terms

$$
\begin{align*}
\nabla_\theta \mathbb E_{x \sim p_{data}} [\log p_\theta(x)] &= \frac{1}{N}\nabla_\theta\sum_{i = 1}^N (\underbrace{-E_\theta(x^{(i)})}_{\text{ data samples}} + \underbrace{E_\theta(\hat x^{(i)})}_{\text{model samples}}) \\
&= - \mathbb E_{x \sim p_{data}} [\nabla_\theta \mathbb E_\theta (x)] + \mathbb E_{x \sim p_\theta} [\nabla_\theta \mathbb E_\theta(x)]
\end{align*}
$$

#### Sampling

We randomly initialize $$\hat x_0$$ at $$t = 0$$. Then, we repeat the following

1. Let $$\hat x' = \hat x_t + \eta$$$ where $$\eta$$ is some noise

2. If  $$\mathbb E_\theta(\hat x') < \mathbb E_\theta(\hat x_t)$$, then choose $$\hat x_{t + 1} = \hat x'$$.

3. Else choose $$\hat x_{t + 1} = \hat x'$$ with probability $$e^{(\mathbb E_\theta(\hat x_t) - \mathbb E_\theta(\hat x'))}$$

In practice, this algorithm takes a long time to converge. A variant of this called **Langevin MCMC** uses the gradient of the distribution to accelerate the sampling procedure

1. Choose $$q(x)$$ an easy to sample prior distribution.

2. Repeat for a fixed number of iterations $$t$$
   
   $$
   \hat x_{t + 1} \sim \hat x_t + \epsilon \nabla_x \log p_\theta(\hat x_t) - \sqrt{2\epsilon} z_t
   $$
   
   where $$z_t \sim \mathcal N(0, I)$$. When $$\epsilon \to 0$$, and $$t \to \infty$$, we have $$\hat x_t \sim p_\theta$$

## Sampling from Noise

### Diffusion Models

The intuition for these models builds from our previous approach. It is hard to map pure noise to $$x \sim N(0, I)$$ to structured data, but it is very easy to do the opposite. To readers familiar with autoregressive models, where we remove one pixel of information at a time, diffusion models  generalise this notion further. Diffusion models have two steps in training - 

The forward process in these models involves adding noise to the image $$x_0$$ over many time steps. At time $$t$$, we add noise $$\epsilon_t$$ to obtain $$x_{t + 1}$$ from $$x_{t}$$. The noise addition is modeled with respect to the following equation

$$
x_t = \sqrt{(1 - \beta_t) x_{t - 1}} + \sqrt{\beta_t}\epsilon_t, \quad \epsilon_t \sim N(0, I)
$$

If this process is repeated for a large number of times, it can be shown that the final output simulates white noise. Now, in the learning part, we train a predictor to learn denoising from $$x_t$$ to $$x_{t - 1}$$. That is, given our model $$f_\theta$$

$$
\hat x_{t - 1} = f_\theta(x_t , t)
$$

### Forward Noising

Given an image $$x_0 \sim q(x)$$, we essentially add the following Gaussian noise in $$T$$ time steps

$$
q(x_t \vert x_{t - 1}) = \mathcal N(x_t ; \sqrt{1 - \beta} x_{t - 1}, \beta_t I)
$$

The term $$\beta_t$$ is referred to as the schedule and $$0 < \beta_t < 1$$. Typically, we set it to a small value in the beginning and do linear increments with time. The above process is a Markov's process, resulting in the following property

$$
q(x_{1:T} \vert x_0) = \prod_{t = 1}^T q(x_t \vert x_{t - 1})
$$

Instead of a slow step-by-step process, training uses samples from arbitrary time step. To decrease the computations, we use the following properties of Gaussian distributions

- Reparameterization trick: $$\mathcal N(\mu, \sigma^2)= \mu + \sigma \epsilon $$ where $$\epsilon \sim \mathcal N(0, I)$$

- Merging Gaussians $$\mathcal N(0, \sigma_1^2 I)$$ and $$\mathcal N(0, \sigma_2^2 I)$$ is a Gaussian of the form$$ \mathcal N(0, (\sigma_1^2 + \sigma_2^2) I)$$

Define $$\alpha_t = 1 - \beta_t$$, and $$\bar \alpha_t = \prod_{i = 1}^t \alpha_i$$, we can now sample $$x_t$$ at an arbitrary time step

$$
\begin{align*}
x_t &= \sqrt{\alpha_t} x_{t - 1} + \sqrt{1 - \alpha_t}\epsilon_{t - 1} \\
&= \sqrt{\alpha_t\alpha_{t - 1}} x_{t - 1} + \sqrt{1 - \alpha_t\alpha_{t - 1}}\epsilon_{t - 1} \\
&\dots \\
&= \sqrt{\bar \alpha_t}x_0 + \sqrt{1 - \bar \alpha_t}\epsilon
\end{align*}
$$

When we schedule $$\beta_t$$ such that $$\beta_1 < \beta_2 < \dots, \beta_T$$ so that $$\bar \alpha_1 > \dots, > \bar \alpha_T$$, such that $$\bar \alpha_T \to 0$$, then

$$
q(x_T \vert x_0) \approx \mathcal N(x_T; 0, I)
$$

The intuition is that the diffusion kernel is a Gaussian

$$
q(x_t) = \int q(x_0, x_t) dx_0 = \int q(x_0) q(x_t \vert x_0) dx_0
$$

There are theoretical bounds showing a relation between the number of steps and overfitting of the model to the distribution. There are no such guarantees for VAEs.

The increasing $$\beta_t$$ schedule sort of accelerates the diffusion process wherein we simulate white noise with few iterations. However, the stable diffusion paper to generate images chose the cosine learning schedule which gave better results.

### Reverse Denoising

The goal is to start with noise and gradually denoise to generate images. We start with $$x_T \sim \mathcal N(0, I)$$ and sample form $$q(x_{t - 1} \vert x_t)$$ to denoise. When $$\beta_t$$ is small enough, we can show that this quantity is a Gaussian. However, estimating the quantity is difficult since it requires optimization over the whole dataset.

Therefore, we learn a model $$p_\theta$$ to reverse the process

$$
P_\theta(x_{t - 1} \vert x_t) = \mathcal N(x_{t - 1}; \mu_\theta(x_t, t), \Sigma)
$$

# 
