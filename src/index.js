const t = require("@babel/types");

/**
 * To improve tree shaking and let webpack do his thing
 * and remove unused code by implicit import.
 * this babel transformer takes care of that.
 * replace imports like
 * import {EntryVendorTaskExportToCsvAction, KalturaEntryVendorTaskFilter} from "kaltura-typescript-client/api/types";
 * to
 * import {EntryVendorTaskExportToCsvAction} from "kaltura-typescript-client/api/types/EntryVendorTaskExportToCsvAction";
 * import {KalturaEntryVendorTaskFilter} from "kaltura-typescript-client/api/types/KalturaEntryVendorTaskFilter";
 * @returns {{visitor: {ImportDeclaration: visitor.ImportDeclaration}}}
 */
module.exports = () => {
    return {
        visitor: {
            ImportDeclaration: (path) => {
                const source = path.node.source.value;
                if (source !== "kaltura-typescript-client/api/types") {
                    return;
                }
                // find imports {KalturaBaseEntry} for example
                // left side of the import statement
                const imports = path.node.specifiers.filter((specifier) =>
                    t.isImportSpecifier(specifier)
                );
                // no imports found
                if (imports.length < 1) {
                    return;
                }
                // create new import deceleration for each import specifier
                const transforms = imports.map((memberImport) => {
                    const newImportSpecifier = t.importSpecifier(
                        t.identifier(memberImport.local.name),
                        t.identifier(memberImport.local.name)
                    );
                    return t.importDeclaration(
                        [newImportSpecifier],
                        t.stringLiteral(`${source}/${memberImport.local.name}`)
                    );
                });
                path.replaceWithMultiple(transforms);
            }
        }
    };
};
