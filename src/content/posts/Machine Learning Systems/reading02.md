Now that we have understood the basics of Machine Learning Systems, let us delve into the two biggest frameworks that support the ML systems today.

# [TensorFlow: A system for large-scale machine learning](https://arxiv.org/pdf/1605.08695)

A product of Google brain built to tackle large scale systems in heterogeneous environments. TensorFlow uses data-flow graphs to represent computations, shared states and operations. These can be mapped across many machines giving a flexibility to the developers. 

TensorFlow is based on a previous product of Google Brain, DistChild, that was used for a large number of research and commercial tasks. The team recognized the recent advances in ML - CNNs that broke records reaching up to millions of parameters and GPUs that accelerated the training processes. They developed a framework that is well-optimized for general scenarios for both training and inference. They also meant for it to be *extensible* - to allow ability to experiment and scale in production with the same code.

Prior to this work, Caffe, Theano and Torch were the major frameworks. Caffe was known for its high-performance, Theano for its data flow model and Torch for its imperative programming model. Along with these works, TensorFlow also draws inspiration from the map-reduce paradigm that improved the performance of data systems significantly.

## TensorFlow execution model

The computation and state of the algorithm, including the mathematical operations are represented in a single dataflow graph. The communications between the subcomputations are made explicitly to execute independent computations in parallel and partition the computation across distributed devices. The key point to note here is that the graph has mutable states for the individual vertices, meaning that data can be shared between different executions of the graph. Although this point may seem trivial now, architectures prior to TensorFlow worked with static computations graphs that did not allow changes to the weights - algorithms such as mini-batch gradient descent were not scalable to large parameter models. Due to this change in the architecture, developers can experiment with different optimization algorithms, consistency schemes and parallelization strategies. 

### Dataflow graph elements

Each vertex in the dataflow graph is an atomic unit of computation and each edge is the output or input to a vertex - values flowing through tensors. 

**Tensors** - Notably, *tensors* as a computational quantity were introduced in this paper. Their work assumes all tensors are dense - this allows simple implementations for memory allocation and serialization.

> Modern neural networks on the contrary have sparse tensors in many scenarios - can be optimized greatly

TensorFlow does allow representing sparse tensors but at the cost of more sophisticated shape inference. 

**Operations** - An operation can simply be thought of as a function that takes $$m \geq 0$$ tensors as input and returns $$n \geq 0$$ tensors as output. The number of arguments to these operators can be constant or variable (*variadic* operators). **Stateful operations** (variables and queues) contain mutable states that can be updated every time the operator executes. Variables are mutable buffers storing shared parameters and queues support advanced forms of coordination. 

### Partial and concurrent execution

The key advantage of storing the dataflow as a graph is the ability to execute independent operations in parallel. Once a graph is defined by the user, the API allows for executing any sub-graph the user queries. Each invocation is a *step* and TensorFlow supports multiple *concurrent steps*. This ability shines for the batch-processing workflows in neural networks. Furthermore, TensorFlow has a checkpointing subgraph that runs periodically for fault tolerance. 

This functionality of running graphs partially and concurrently contribute much to TensorFlow's flexibility. 

### Distributed execution

Since the communication between subcomputations is explicit, the distribution of the dataflow becomes simpler. Each operation resides on a particular *device* (note that this feature has also been adapted in PyTorch), and a device is responsible for executing a *kernel* for each operation assigned to it. TensorFlow allows multiple kernels to be registered for a single operation.

The placement algorithm computes a feasible set of devices for each operation, calculates the sets of operations that must be colocated and selects a satisfying device for each colocation group. In addition, the users can also specify their device preferences for a particular task. *Yes, TensorFlow was advanced since the beginning*.

Once the operations are placed, the partial subgraphs are computed for a step, and are pruned and partitioned across the devices. The communication mechanisms between devices is also put in place with specialized implementations to optimize for latency with large-subgraphs running repeatedly. On the user-end, a *client session* maintains a mapping from step definitions to cached subgraphs. This computation model performs the best with static, reusable graphs but also supports dynamic computations with control flows. 

### Dynamic control flow

Although most evaluation in TensorFlow is *strict*, wherein it requires for all inputs to an operation to be computed before the operation executes, advanced algorithms (such as RNNs), require dynamic control flow, requiring non-strict evaluation. To aid with this, TensorFlow also supports primitive **Switch** (demultiplexer) and **Merge** (multiplexer) operations for dynamic dataflow architectures! These primitives can be used to build a non-strict conditional sub-graph that executes one of two branches based on the runtime values of a tensor. These primitives also support loops with additional structural constraints based on the dataflow!

## Extensibility

- **Differentiation** - TensorFlow has a user-level library that **automatically differentiates** expressions. It performs a breadth-first search to identify all of the backwards paths from the target operation (loss function) to a set of parameters in the computation graph, and sums the partial gradients that each path contributes. With optimizations such as batch normalization and gradient clipping, the algorithm also supports backpropagation through conditional and iterative subcomputations! All of this done with memory management on GPU.

- **Optimization** - SGD is a simple algorithm encoded in the framework. However, for more advanced optimization schemes like Momentum, TensorFlow relies on community driven implementations that are easily pluggable without modifying the underlying system. Such a modular framework was not available before.

- **Handling Large models** - Even back then, the language models were too large to store in RAM of a single host. For the language specific case, TensorFlow has *sparse embedding layers* that is a primitive operation that abstracts storing and reading a tensor across different memory spaces. They are implemented with operators such as `gather`, `part` and `stitch`, and their gradients are also implemented. Along with innovations such as Project Adam, TensorFlow's training was ultimately made efficient through community driven improvements.

- **Fault Tolerance** - Since many learning algorithms do not require consistency and writing at every step is compute intensive, TensorFlow implements user-level checkpointing for fault tolerance. This design decision leaves it to the user to build their own best fault handling mechanisms. *I wish they had an automatic version as well*.

- **Synchronous replica coordination** - SGD is robust to asynchrony, and TensorFlow is designed for asynchronous training. In the asynchronous case, each worker reads the current value when the step begins, applies its gradient to the different current value at the end. The synchronous cases use queues to coordinate execution, allowing multiple gradient updates together. Although the throughput is reduced, this way of training is more efficient. TensorFlow implements *backup workers* to improve the throughput of this synchronous case by 15%.

## Implementation

The core TensorFlow library is implemented in C++ for portability and performance with its implementation being open-source. It consists of 

- Distributed master - given a graph and a step definition, it prunes and partitions the graphs to each devices, and caches these subgraphs so that they may be reused in subsequent steps. 

- Dataflow executor - Schedules the execution of the kernels that comprise a local subgraph - optimized for running large fine-grained graphs with low overhead. 

The API can be accessed both via C++ and Python.

The library does not provide huge gains for single-system training but has higher throughput for large models across multiple devices. 

## Conclusion

When this paper was published, TensorFlow was still a work in progress. Later, the library transformed significantly with the introduction of v2, and other optimizations. 

# [PyTorch: An Imperative Style, High-Performance Deep Learning Library](https://arxiv.org/abs/1912.01703)

A product of Facebook research, PyTorch is the most popular deep-learning library. They addressed the biggest limitation in previous frameworks - usability. They targeted both performance and usability by designing an imperative-style ML framework. 

In contrast to PyTorch, the previous approaches created a static dataflow graph that represents the computation. Since the whole computation is visible ahead of time, it can be leveraged to improve performance and scalability. However, due to this, the usability is reduced and cannot be used to iteratively build experiments. PyTorch, a python library, performs immediate execution of dynamic tensor computations with automatic differentiation and GPU acceleration while maintaining comparable performance to the static libraries. 

## Background

There were four major trends in scientific computing that have become important for deep learning:

1. Development of domain-specific languages and libraries for tensor manipulation (e.g., APL, MATLAB, NumPy made array-based productive productive)
2. Automatic differentiation, making it easier to experiment with different machine learning approaches
3. Shift towards open-source Python ecosystem from proprietary software. The network effects of Python contributed to its exponential growth. 
4. Availability of general-purpose parallel hardware like GPUs

PyTorch builds on these trends by providing an array-based programming model accelerated by GPUs and differentiable via automatic differentiation integrated in the Python ecosystem. 

## Design Principles

PyTorch's design is based on four main principles:

1. Be Pythonic: Integrate naturally with Python ecosystem, keep interfaces simple and consistent
2. Put researchers first: Make writing models, data loaders, and optimizers easy and productive
3. Provide pragmatic performance: Deliver compelling performance without sacrificing simplicity
4. "Worse is better": Prefer simple, slightly incomplete solutions over complex, comprehensive designs

## Usability-centric Design

The approach to PyTorch starts by considering deep-learning models as just another Python program. By considering so, PyTorch maintains the imperative programming model inspired from Chainer and Dynet. Defining layers, composing models, loading data, running optimizers and parallelizing the training process can all be expressed using familiar Python syntax. It allows any new potential neural network architecture to be easily implemented with composability. 

Mainly, since PyTorch programs execute eagerly, all features of Python like print, debugging and visualization work as expected. In addition, PyTorch has -

- **Interoperability** - Integrated well with other libraries to allow bidirectional exchange of data (NumPy, Matplotlib, etc). 

- **Extensibility** - Supports custom differentiable functions and datasets. The abstractions take care of shuffling, batching, parallelization, and management of pinned CUDA memory to improve the throughput and performance. In general, PyTorch components are completely interchangeable!

### Automatic differentiation

Python is a dynamic programming language that has most of the behavior defined at run-time, making it difficult to pre-calculate the differentiation. Instead, PyTorch uses operator overloading approach to build up a representation of the computed function every time it is executed. It notes the difference between forward mode and backward mode automatic differentiation and adopts the latter which is better suited for ML applications.

Their system can differentiate through code with mutation on tensors as well. They also have a versioning system for tensors as a failsafe to track the modifications.

## Performance-focused Implementation

With all these considerations to usability, the developers implemented many tricks to maintain the performance of the library. Since the models have to run on Python interpreter, which has its own limitations such as the global interpreter lock (ensures only one of any concurrent threads is running at a given time), PyTorch optimized every aspect of execution and also enabled users to add their own optimization strategies. Prior frameworks avoided these constraints by deferring the evaluation to their custom interpreters. 

Most of PyTorch is implemented C++ for high performance. The core `libtorch` library implements the tensor data structure, GPU and CPU operators, automatic differentiation system with gradient formulas for most built-in functions and basic parallel primitives. The pre-computed gradient functions allow computation of gradients of core PyTorch operators in a multithreaded evaluation evading the Python global interpreter lock. The bindings are generated using YAML meta-data files, that allowed the community to create bindings to other languages. 

PyTorch separates the control (program branches, loops) and the data flow (tensors and the operations). The Control flow handled by Python and optimized C++ code on CPU and Data flow can be executed on CPU or GPU. PyTorch is designed to run asynchronously leveraging the CUDA stream mechanism. This allows overlap of Python code execution on CPU with tensor operations on the GPU, effectively saturating GPU with large tensor operations. The main performance cover-up comes from this design.

Since every operator needs to allocate an output tensor to hold the results, the speed of *dynamic memory allocators* needs to be optimized. CPU has efficient libraries to handle this. However, to avoid the bottleneck of `cudaFree` routine that blocks code until all previously queued work on GPU completes, PyTorch implements its custom allocator that incrementally builds up a cache of CUDA memory. It reassigns it to later allocations without CUD APIs for better interoperability allowing users to use other GPU enabled Python packages. This allocator is further optimized with memory usage patterns and its implementation is simplified with the *one-pool-per-stream* assumption. 

The `multiprocessing` library was developed to evade the global interpreter lock on Python. However, this is inefficient for large arrays, so it is extended as `torch.multiprocessing` to allow automatic movement of data to shared memory improving the performance significantly. It also transparently handles sharing of CUDA tensors to build analytical systems on top of this. 

Since users write models to consume all the memory resources, PyTorch treats memory as a scarce resource and handles it carefully. The overheads of garbage collection are too large. To solve this, PyTorch relies on a reference counting scheme to track the number of uses of each tensors, and frees the underlying memory *immediately* when this count reaches zero. This ensures immediate freeing of memory when tensors become unneeded.

With all these optimizations, PyTorch achieves

- ability to asynchronously execute dataflow on GPU with almost perfect device utilization

- custom memory allocator showing improved performance

- performance within 17% of the fastest framework across all benchmarks

## Conclusion

The paper concludes by highlighting PyTorch's success in combining usability with performance. Future work includes:

- Developing PyTorch JIT for optimized execution outside the Python interpreter
- Improving support for distributed computation
- Providing efficient primitives for data parallelism
- Developing a Pythonic library for model parallelism based on remote procedure calls

## 


