# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2022-11-11
### Fixed
- Concurrent state exit bug where sibling states had child states with the same
  name.

## [0.2.0] - 2022-04-20
### Added
- OVERVIEW docs.
- API docs.

### Changed
- Allow condition functions to return `undefined` so that a state can both use a
  condition function and be a history state.

## [0.1.1] - 2022-03-13
### Added
- Toggle example app.
- Stopwatch example app.

### Changed
- Package size optimizations.

## [0.1.0] - 2022-03-09
### Added
- Initial release.

[0.2.1]: https://github.com/burrows/statechart/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/burrows/statechart/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/burrows/statechart/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/burrows/statechart/releases/tag/v0.1.0
