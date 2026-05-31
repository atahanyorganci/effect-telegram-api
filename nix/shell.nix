{
  perSystem = {pkgs, ...}: {
    devShells.default = pkgs.mkShellNoCC {
      buildInputs = with pkgs; [
        nodejs-slim
        corepack
        doppler
        just
      ];
      shellHook = ''
        corepack install
      '';
    };
  };
}
