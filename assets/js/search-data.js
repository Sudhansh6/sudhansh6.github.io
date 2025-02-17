// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-articles",
          title: "Articles",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A collection of projects I&#39;ve worked on, including personal and professional endeavors.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "dropdown-challenges",
              title: "Challenges",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-miscellaneous",
              title: "Miscellaneous",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "post-brains-and-ai",
      
        title: "Brains and AI",
      
      description: "The primary motivation for AI stems from our brains. How has our research in cognitive science shaped the modern AI systems?",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/brains-and-ai/";
        
      },
    },{id: "post-machine-learning-systems",
      
        title: "Machine Learning Systems",
      
      description: "Few keypoints from books other important papers in the field.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/machine-learning-systems/";
        
      },
    },{id: "post-ai-agents",
      
        title: "AI Agents",
      
      description: "Everyone is talking about agents. But what is an agent? Is it just a buzzword being thrown around? This article talks deeply about this issue along with the technical ideas associated.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/ai-agents/";
        
      },
    },{id: "post-reinforcement-learning-theory",
      
        title: "Reinforcement Learning Theory",
      
      description: "A deep dive of the basic RL theory and how we used them in modern ML systems.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/rl-theory/";
        
      },
    },{id: "post-data-systems-for-machine-learning",
      
        title: "Data Systems for Machine Learning",
      
      description: "Prompting ChatGPT is not enough. To build large-scale AI systems, it is imperative to understand how to design the proper systems to optimize all the computations. The following blog is a deep-dive into system/data design for Machine Learning frameworks.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/data-systems-for-ml/";
        
      },
    },{id: "post-statistical-natural-language-processing",
      
        title: "Statistical Natural Language Processing",
      
      description: "Enter the world of Natural Language Processing.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Statistical-NLP/";
        
      },
    },{id: "post-large-language-model-reasoning",
      
        title: "Large Language Model Reasoning",
      
      description: "A survey of papers to better understand the workings of Large Language Models.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Large-Language-Models-Research/";
        
      },
    },{id: "post-design-and-analysis-of-algorithms",
      
        title: "Design and Analysis of Algorithms",
      
      description: "A collection of ideas for design algorithms and analyzing them.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Design-and-Analysis-of-Algorithms/";
        
      },
    },{id: "post-tabletop-manipulation-algorithms",
      
        title: "Tabletop Manipulation Algorithms",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Tabletop-Rearrangement/";
        
      },
    },{id: "post-evaluating-interactions-in-music",
      
        title: "Evaluating interactions in music",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Evaluting-Music-with-RL/";
        
      },
    },{id: "post-reinforcement-learning-in-nuclear-fusion",
      
        title: "Reinforcement Learning in Nuclear Fusion",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Control-for-Nuclear-Fusion/";
        
      },
    },{id: "post-scalable-behavior-planning-for-autonomous-driving",
      
        title: "Scalable Behavior Planning for Autonomous Driving",
      
      description: "Discussion on algorithms for predicting behavior patters in dense urban scenes.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Behavior-Planning-for-Autonomous-Driving/";
        
      },
    },{id: "post-structural-visualization-for-neural-networks",
      
        title: "Structural Visualization for Neural Networks",
      
      description: "Analysing learning patterns in neural networks using graph visualization algorithms.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Structural-Visualization-for-Neural-Network/";
        
      },
    },{id: "post-advanced-computer-vision",
      
        title: "Advanced Computer Vision",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Advanced-Computer-Vision/";
        
      },
    },{id: "post-mathematics-for-finance",
      
        title: "Mathematics for Finance",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Mathematics-for-Finance/";
        
      },
    },{id: "post-lattices-in-cryptography-and-quantum-computers",
      
        title: "Lattices in Cryptography and Quantum Computers",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Lattices-in-Cryptography/";
        
      },
    },{id: "post-object-detection",
      
        title: "Object Detection",
      
      description: "A brief survey of object detection methods in 2023.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Object-Detection/";
        
      },
    },{id: "post-numerical-analysis-notes",
      
        title: "Numerical Analysis Notes",
      
      description: "A course disucssing interpolation theory, numerical intergration, numerical solutions to ordinary differential equations, numerical solutions to system of linear equations and roots of non-linear equations.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/NumAn/";
        
      },
    },{id: "post-dibs-notes",
      
        title: "DiBS Notes",
      
      description: "An introductory course for design and programming of database systems. Covers the entity-relationship (ER) approach to data modelling, the relational model of database management systems (DBMSs) and the use of query languages such as SQL. Briefly discusses query processing and the role of transaction management.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/dbms/";
        
      },
    },{id: "post-automata-notes",
      
        title: "Automata Notes",
      
      description: "An introductory course to Automata theory. The first half covers DFAs, NFAs, and their various properties. Relations of regularity of languages and DFAs/NFAs and proofs of non-regularity of languages. The second half of the notes covers pushdown automata, context free grammar and their relation with deterministic PDAs. Briefly touches upon Turing machines.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/automata/";
        
      },
    },{id: "post-ipl-notes",
      
        title: "IPL Notes",
      
      description: "A course covering the details of the inner workings of a compiler. We start off with scanning ,parsing and semantic analysis to generate ASTs. Then, we discuss IR generator to create TAC. Lastly, we discuss a few register allocation algorithms.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/ipl/";
        
      },
    },{id: "post-operating-system-notes",
      
        title: "Operating System Notes",
      
      description: "Basic concepts of Operating Systems like process abstraction, process execution mechanism, inter-process mechanism, memory management, paging, memory allocation and free space management algorithms, threads and concurrency, locks, condition variables, semaphores, I/O and filesystems, etc.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/operating-systems/";
        
      },
    },{id: "post-philosophy-notes",
      
        title: "Philosophy Notes",
      
      description: "An introductory philosophical course discussing the transitions in philosophical thought from Greek philosophy to modern philosophy. The notes cover topics such as classical philosophy, Socratic period, Indian philosophy, and modern philosophy.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/philosophy/";
        
      },
    },{id: "post-machine-learning-cheatsheet",
      
        title: "Machine Learning Cheatsheet",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Machine-Learning-Cheatsheet/";
        
      },
    },{id: "post-programming-cheatsheet",
      
        title: "Programming Cheatsheet",
      
      description: "A quick overview of all the important concepts in DSA.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/programming/";
        
      },
    },{id: "post-handling-broken-python-packages",
      
        title: "Handling broken python packages",
      
      description: "A post to guide you through mending python libraries on Ubuntu",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Fix-Python-Ubuntu/";
        
      },
    },{id: "post-windows-11",
      
        title: "Windows 11",
      
      description: "An overview of the new features in the developer edition of Windows 11.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Windows-11/";
        
      },
    },{id: "post-modulo-compressed-sensing",
      
        title: "Modulo Compressed Sensing",
      
      description: "An introduction to recovery methods for measurements using fixed dynamic range sensors.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Modulo-Compressed-Sensing/";
        
      },
    },{id: "post-generative-adversarial-networks-for-compressed-sensing",
      
        title: "Generative Adversarial Networks for Compressed Sensing",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/GANs-for-Compressed-Sensing/";
        
      },
    },{id: "post-low-rank-tensor-recovery-for-joint-probability-distribution",
      
        title: "Low Rank Tensor Recovery for Joint Probability Distribution",
      
      description: "An introduction to Tensors and notation. Summary of a few papers.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/Low-Rank-Tensor-Recovery/";
        
      },
    },{id: "news-joined-cognitive-robotics-lab-under-the-supervision-of-prof-henrik-christensen",
          title: 'Joined Cognitive Robotics Lab under the supervision of Prof. Henrik Christensen',
          description: "",
          section: "News",},{id: "news-paper-on-bounds-for-compressive-signal-recovery-accepted-at-signal-processing-2024",
          title: 'Paper on bounds for compressive signal recovery accepted at Signal Processing 2024.',
          description: "",
          section: "News",},{id: "news-started-teaching-assistantship-for-quantum-cryptography",
          title: 'Started Teaching Assistantship for Quantum Cryptography',
          description: "",
          section: "News",},{id: "news-started-teaching-assistantship-for-theory-of-computing",
          title: 'Started Teaching Assistantship for Theory of Computing',
          description: "",
          section: "News",},{id: "news-started-teaching-assistantship-for-design-and-analysis-of-algorithms",
          title: 'Started Teaching Assistantship for Design and Analysis of Algorithms',
          description: "",
          section: "News",},{id: "news-participated-in-the-supabase-ai-hackathon-and-won-an-honorable-mention-for-mirror-ai",
          title: 'Participated in the Supabase AI Hackathon and won an honorable mention for Mirror...',
          description: "",
          section: "News",},{id: "news-paper-on-identification-and-correction-of-permutation-errors-in-compressed-sensing-based-group-testing-accepted-at-icassp-2025",
          title: 'Paper on Identification and Correction of Permutation Errors in Compressed Sensing Based Group...',
          description: "",
          section: "News",},{id: "news-paper-on-scalable-tabletop-rearrangement-algorithm-accepted-at-icra-2025",
          title: 'Paper on Scalable Tabletop Rearrangement Algorithm accepted at ICRA 2025',
          description: "",
          section: "News",},{id: "projects-inverse-rendering-with-2d-gaussian-splatting",
          title: 'Inverse Rendering with 2D Gaussian Splatting',
          description: "Developed a novel framework in CUDA for inverse rendering using 2D Gaussian splatting. Achieved state-of-the-art results gaining 15% lower normal map error, and obtained more consistent relighting results.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2DGSIR/";
            },},{id: "projects-perception-for-home-robot",
          title: 'Perception for Home Robot',
          description: "Experimenting with various NeRF and Gaussian Splatting based SLAM algorithms to build a real-time 3D reconstruction of the environment. The methods used include NeRF-SLAM, Nice SLAM, Mip-NeRF and Splatam.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Home_Robot/";
            },},{id: "projects-image-colorization",
          title: 'Image Colorization',
          description: "An image colorization application that converts black and white images to colored ones using pix2pix model. Also includes interactive digit recognition webapp.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Image_Colorization/";
            },},{id: "projects-vscode-journal-plugin",
          title: 'VSCode Journal Plugin',
          description: "VS Code all-in-one journal plugin, combining automated TODO extraction, daily notes, task syncing, file tagging, and natural language support for seamless task management and note-taking",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Journal_Plugin/";
            },},{id: "projects-stochastic-primal-dual-network-for-3d-tomographic-reconstruction",
          title: 'Stochastic Primal-Dual Network for 3D Tomographic reconstruction',
          description: "Developed a stochastic version of primal-dual algorithm for reconstructing image volumes from CT scans. Implemented a python framework with custom Tensorflow layers and a library using Astra to aid the project.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/LSPD/";
            },},{id: "projects-low-rank-matrix-recovery",
          title: 'Low Rank Matrix Recovery',
          description: "A in-depth analysis of problem formulations for low-rank matrix recovery such as Robust Principal Component Pursuit, and algorithms such as ALM and Dual Optimization. Extended the approach to applications such as Foreground-Background separation in videos.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Low_Rank_Matrix_Recovery/";
            },},{id: "projects-mathprompter",
          title: 'MathPrompter++',
          description: "MathPrompter++ improves the reasoning capabilities of LLMs on numerical problems with robustness by embedding zero-shot CoT in a former Microsoft Research paper - MathPrompter ICLR 2023. The method improves the accuracy while reducing the hallucinate rate. Furthermore, I compiled a new dataset DiverseMath that serves as a better benchmark for reasoning in numerical problems.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/MathPrompter++/";
            },},{id: "projects-object-detection-using-yolov8",
          title: 'Object Detection using YOLOv8',
          description: "An exploration of different libraries such as `ultralytics` and `fiftyone` to train YOLO on COCO for object detection to understand ML pipelines.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Object_Detection/";
            },},{id: "projects-permutation-noise-in-compressed-sensing",
          title: 'Permutation Noise in Compressed Sensing',
          description: "Analysis of permutation noise in linear measurement applications. Has a prominent application in group testing for Covid 19. Proposed a hypothesis testing based correction algorithm along with theory and experiments.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Permutation_Noise/";
            },},{id: "projects-quantum-money",
          title: 'Quantum Money',
          description: "Motivation for Quantum Money. Description of different quantum money schemes - secret and public key based. Detailed analysis of various adaptive attacks on secret-key schemes and briefly touches upon the soundness of public-key schemes.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Quantum_Money/";
            },},{id: "projects-recipe-rating-prediction",
          title: 'Recipe Rating Prediction',
          description: "A project with data exploration, feature engineering, recommendation models based on Random Forest and Logistic Regression to predict recipe ratings, addressing challenges like data imbalance and sparse interactions.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Recipe_Rating/";
            },},{id: "projects-saturation-noise-in-compressed-sensing",
          title: 'Saturation Noise in Compressed Sensing',
          description: "An in-depth analysis of compressive signal recovery methods in the presence of Gaussian noise and Saturation effects. Conducted experiments on synthetic signals, images and audio. Also derived a detailed proof for performance guarantees of the novel Likelihood Maximization method.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Saturation_Noise/";
            },},{id: "projects-stable-diffusion-models",
          title: 'Stable Diffusion Models',
          description: "A brief introduction to image synthesis applications, stable diffusion models and its applications.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Stable_Diffusion_Models/";
            },},{id: "projects-instance-segmentation-using-u-net",
          title: 'Instance Segmentation using U-Net',
          description: "Developed a U-Net for instance segmentation using custom dataloaders and pre-processing techniques on PyTorch on the COCO dataset.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/UNet_segmentation/";
            },},{id: "projects-virtual-keyboard",
          title: 'Virtual Keyboard',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Virtual_Keyboard/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
