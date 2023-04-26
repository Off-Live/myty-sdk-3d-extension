using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using Avatar.Interface;
using MYTYKit.AvatarImporter;
using MYTYKit.MotionAdapters;
using MYTYKit.MotionTemplates;
using UnityEngine;
using UnityEngine.Assertions;

namespace Avatar
{
    public class AvatarManager3D : AvatarManager
    {
        [SerializeField]
        GameObject m_loaderPrefab;

        Dictionary<(long, string), AvatarObject> m_avatarObjectMap = new();
        
        AvatarObject m_currentAvatar;
        
        bool m_applyBodyMocap;

        class AvatarObject
        {
            public GameObject avatar;
            public MYTY3DAvatarDriver driver;
        }

        public override void LoadAvatar(
            long avatarCollectionId,
            string tokenId,
            byte[] metadata,
            byte[] tokenAsset)
        {
            // Currently, assuming we have only one assetUri for avatar
            Assert.IsNull(metadata);
            
            var metadataJson = "";
            byte[] mainBodyGlb;
            List<byte[]> traitsGlb;
            using (var memoryStream = new MemoryStream(tokenAsset))
            {
                using (var zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Read))
                {
                    // May change json file name
                    var metadataFileName = $"{tokenId}.json";
                    var metadataEntry = zipArchive.GetEntry(metadataFileName);
                    using (var reader = new StreamReader(metadataEntry.Open()))
                    {
                        metadataJson = reader.ReadToEnd();
                    }
                    
                    // May change main body glb file name
                    var mainBodyFileName = $"{tokenId}.glb";
                    var mainBodyEntry = zipArchive.GetEntry(mainBodyFileName);
                    using (var stream = mainBodyEntry.Open())
                    {
                        mainBodyGlb = new byte[mainBodyEntry.Length];
                        stream.Read(mainBodyGlb, 0, mainBodyGlb.Length);
                    }
                    
                    foreach (var traitsEntry in zipArchive.Entries.Where(e => e.Name != metadataFileName && e.Name != mainBodyFileName))
                    {
                        // TBD : process glb files that are not mainbody
                    }
                }
            }
            
            var loaderObjects = Instantiate(m_loaderPrefab, transform);
            var importer = loaderObjects.GetComponentInChildren<MYTY3DAvatarImporter>();
            var driver = loaderObjects.GetComponentInChildren<MYTY3DAvatarDriver>();

            importer.LoadMainbody(
                mainBodyGlb,
                metadataJson,
                (avatar) => 
                    RegisterAvatar(avatarCollectionId, tokenId, avatar, driver)
            );
        }

        public override void SelectAvatar(long avatarCollectionId, string tokenId)
        {
            if (m_currentAvatar != null)
            {
                m_currentAvatar.avatar.SetActive(false);
            }
            var target = m_avatarObjectMap[(avatarCollectionId, tokenId)];
            target.avatar.SetActive(true);
            m_currentAvatar = target;
            ApplyMode();
        }

        public override void SwitchMode()
        {
            m_applyBodyMocap = !m_applyBodyMocap;
            ApplyMode();
        }

        public override bool IsMetadataLoaded(long avatarCollectionId)
        {
            return false;
        }

        public override bool IsAvatarLoaded(long avatarCollectionId, string tokenId)
        {
            return m_avatarObjectMap.ContainsKey((avatarCollectionId, tokenId));
        }

        private void RegisterAvatar(long avatarCollectionId, string tokenId, GameObject avatar, MYTY3DAvatarDriver driver)
        {
            m_avatarObjectMap[(avatarCollectionId, tokenId)] = new AvatarObject
            {
                avatar = avatar,
                driver = driver
            };
            var mapper = driver.transform.parent.parent.gameObject.GetComponentInChildren<MotionTemplateMapper>();
            motionSource.motionTemplateMapperList.Add(mapper);
            motionSource.UpdateMotionAndTemplates();
            SelectAvatar(avatarCollectionId, tokenId);
        }

        private void ApplyMode()
        {
            m_currentAvatar.driver.applyBodyMocap = m_applyBodyMocap;
            m_currentAvatar.driver.transform.localRotation = Quaternion.AngleAxis(m_applyBodyMocap ? 0 : 180, Vector3.up);
        }
    }
}