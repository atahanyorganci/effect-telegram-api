{
  description = "Nix replacement built with Effect";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = inputs @ {
    flake-parts,
    self,
    treefmt-nix,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;}
    {
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
      imports = [
        treefmt-nix.flakeModule
        ./nix/shell.nix
        ./nix/treefmt.nix
      ];
      perSystem = {system, ...}: let
        pkgs = import self.inputs.nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            allowBroken = true;
          };
        };
      in {
        _module.args = {
          inherit pkgs;
        };
      };
    };
}
