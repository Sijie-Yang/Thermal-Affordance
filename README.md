# Thermal Affordance

> **The inherent capacity of built environment to influence human thermal comfort based on its morphological and physical features.**

[![Website](https://img.shields.io/badge/Website-Live-brightgreen)](https://thermal-affordance.ual.sg)
[![Paper](https://img.shields.io/badge/Paper-Building%20and%20Environment-blue)](https://www.sciencedirect.com/science/article/abs/pii/S0360132325000514)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/Sijie-Yang/VATA)

## 🌟 Overview

**Thermal Affordance** represents the inherent capacity of a streetscape to influence human thermal comfort based on its visual and physical features. This concept integrates various environmental factors, indicating the possible thermal comfort experienced in urban environments.

This repository hosts the official website and portal for Thermal Affordance research, providing access to:

- 📄 **Core Research Papers** - Latest publications on thermal affordance
- 🗺️ **Interactive Maps** - Visual assessment of thermal affordance across cities
- 📊 **Datasets** - Downloadable geospatial data for research
- 🔬 **Research Collection** - Comprehensive list of related studies

## 🔬 Core Paper

**Yang, S., Chong, A., Liu, P., & Biljecki, F.** (2025). Thermal comfort in sight: Thermal affordance and its visual assessment for sustainable streetscape design. *Building and Environment*, 271, 112569.

- [📄 Paper](https://www.sciencedirect.com/science/article/abs/pii/S0360132325000514)
- [💻 GitHub Repository](https://github.com/Sijie-Yang/VATA)
- [🗺️ Interactive Website](https://thermal-affordance.ual.sg)

## 🌐 Website

Visit our interactive website: **[thermal-affordance.ual.sg](https://thermal-affordance.ual.sg)**

The website features:
- **Concept Description** - Understanding thermal affordance and VATA framework
- **Methodology** - Computational framework and visual assessment methods
- **Planning Applications** - Urban-scale thermal affordance mapping
- **Interactive Maps** - Explore thermal affordance data for different cities
- **Research Collection** - Latest publications in thermal affordance research

## 📊 Dataset

Download thermal affordance datasets for research purposes:

- **Singapore Dataset** - VATA perception points for Singapore
- **Multi-city Dataset** - Eight cities, with point and H3 resolution 9 hex GeoPackages

Visit the [Dataset & Mapping](https://thermal-affordance.ual.sg/#map) section on our website for downloads.

## 👥 Research Team

- **Sijie Yang** - Department of Architecture, National University of Singapore / School of Engineering and Applied Science, University of Pennsylvania
- **Adrian Chong** - Department of Built Environment, National University of Singapore
- **Pengyuan Liu** - Future Cities Lab Global, Singapore-ETH Centre
- **Filip Biljecki** - Department of Architecture & Department of Real Estate, National University of Singapore

## 📚 Related Research

Our research builds on and contributes to the growing field of thermal comfort assessment in urban environments. Check out the [In Research](https://thermal-affordance.ual.sg/#research) section on our website for a comprehensive list of related publications.

## 🔧 Technical Details

This website is built with:
- **Gatsby** - React-based static site generator
- **MapLibre GL** - Interactive mapping
- **Styled Components** - Component styling
- **Responsive Design** - Mobile-friendly interface

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run develop

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📖 Citation

If you use our work in your research, please cite:

```bibtex
@article{yang2025thermal,
  title={Thermal comfort in sight: Thermal affordance and its visual assessment for sustainable streetscape design},
  author={Yang, Sijie and Chong, Adrian and Liu, Pengyuan and Biljecki, Filip},
  journal={Building and Environment},
  volume={271},
  pages={112569},
  year={2025},
  publisher={Elsevier}
}
```

## 🔗 Links

- 🌐 **Website**: [thermal-affordance.ual.sg](https://thermal-affordance.ual.sg)
- 📄 **Paper**: [Building and Environment](https://www.sciencedirect.com/science/article/abs/pii/S0360132325000514)
- 💻 **Code**: [GitHub Repository](https://github.com/Sijie-Yang/VATA)
- 🏢 **Lab**: [Urban Analytics Lab](https://ual.sg)

## 📄 License

A standalone data reuse license has not been confirmed in this repository. See `static/data/LICENSE.txt` and contact the research team before reuse. Do not assume that a software license also applies to the data.

## 🙏 Acknowledgments

This research is supported by the National University of Singapore and the Singapore-ETH Centre. We thank all participants in our surveys and the contributors to this project.

---

**Thermal Affordance** - Enhancing urban thermal comfort through visual assessment and sustainable streetscape design.

## Data releases

The website reads city counts, download filenames, sizes and SHA-256 checksums from
`static/data/cities.json`. Do not maintain a separate frontend city catalog.

```bash
# Package existing GPKGs with documentation and refresh manifest metadata
npm run data:build

# Validate ZIP contents against source files and confirm metadata
npm run data:check
```

`npm run build` runs the data check first and fails if a ZIP is missing, corrupt
or stale. Include the generated ZIPs, GPKGs, web JSON/GeoJSON, documentation and
manifest in the release/source checkout; an untracked local file will not appear
in a fresh checkout. Original parquet re-export is supported by
`scripts/export_tcis_web.py`, including web point JSON and the same ZIP builder.

Use `/dataset/` for a dedicated explorer. City, layer and scale are shareable,
for example `?city=tokyo&layer=hex&scale=within-city#map`. Data is loaded as the
map approaches the viewport; the eight most recent city/layer files are cached
in memory. Within-city percentiles are unweighted within the selected layer.
