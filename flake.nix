{
  description = "DevOps Monitoring Dashboard - Full Stack Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # SỬA Ở ĐÂY: Thêm config allowUnfree = true
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # DevOps Tools
            terraform      
            ansible        
            awscli2        
            sshpass        
	    openssh
	    lazygit
            rsync          # Required for Ansible synchronize
            
            # Development Tools
            nodejs_20      # Node.js 20 LTS
            nodePackages.npm
            nodePackages.nodemon
            git
          ];

          shellHook = ''
            echo "========================================================"
            echo "🚀 DevOps Monitoring Dashboard - Dev Environment"
            echo "========================================================"
            echo "📦 DevOps Tools:"
            echo "   - Terraform: $(terraform --version | head -n 1)"
            echo "   - Ansible: $(ansible --version | head -n 1)"
            echo "   - AWS CLI: $(aws --version)"
            echo ""
            echo "⚡ Development Tools:"
            echo "   - Node.js: $(node --version)"
            echo "   - npm: $(npm --version)"
            echo ""
            echo "💡 Quick Commands:"
            echo "   tf     → terraform"
            echo "   ans    → ansible-playbook"
            echo "========================================================"
            
            alias tf="terraform"
            alias ans="ansible-playbook"
          '';
        };
      }
    );
}
